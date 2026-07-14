const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { insertPost, getPostById, deletePostById, updatePostById, getPostsBatch, getRecentPostsByAuthor } = require('../models/Post');
const { insertLike, deleteLike } = require('../models/Like');
const { insertComment, getCommentsByPostId } = require('../models/Comment');
const { sendEvent } = require('../kafka/producer');

const createPostSchema = Joi.object({
  content: Joi.string().required(),
  mediaUrl: Joi.string().uri().allow(null, '').optional(),
});

const createPost = async (req, res) => {
  try {
    const authorId = req.headers['x-user-id'] || req.body.userId;
    if (!authorId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const { error, value } = createPostSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { content, mediaUrl } = value;
    const postId = uuidv4();

    const post = await insertPost(postId, authorId, content, mediaUrl);

    await sendEvent('post-events', {
      type: 'PostCreated',
      postId: post.id,
      authorId: post.author_id,
      createdAt: post.created_at
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPost = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || null;
    const post = await getPostById(req.params.id, userId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const authorId = req.headers['x-user-id'] || req.body.userId;
    if (!authorId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const deleted = await deletePostById(req.params.id, authorId);
    if (!deleted) return res.status(404).json({ error: 'Post not found or unauthorized' });

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const authorId = req.headers['x-user-id'] || req.body.userId;
    if (!authorId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const { content, mediaUrl } = req.body;
    if (!content && content !== '') return res.status(400).json({ error: 'Content is required' });

    const updated = await updatePostById(req.params.id, authorId, content, mediaUrl);
    if (!updated) return res.status(404).json({ error: 'Post not found or unauthorized' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const likePost = async (req, res) => {
  try {
    const likedBy = req.headers['x-user-id'] || req.body.userId;
    if (!likedBy) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const postId = req.params.id;
    const post = await getPostById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const like = await insertLike(postId, likedBy);

    await sendEvent('post-events', {
      type: 'PostLiked',
      postId,
      likedBy,
      postOwnerId: post.author_id
    });

    res.status(201).json(like);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const unlikePost = async (req, res) => {
  try {
    const unlikedBy = req.headers['x-user-id'] || req.body.userId;
    if (!unlikedBy) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const postId = req.params.id;
    const deleted = await deleteLike(postId, unlikedBy);

    if (deleted) {
      await sendEvent('post-events', {
        type: 'PostUnliked',
        postId,
        unlikedBy
      });
    }

    res.json({ message: 'Post unliked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addCommentSchema = Joi.object({
  content: Joi.string().required()
});

const addComment = async (req, res) => {
  try {
    const commenterId = req.headers['x-user-id'] || req.body.userId;
    if (!commenterId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const { error, value } = addCommentSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const postId = req.params.id;
    const post = await getPostById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const commentId = uuidv4();
    const comment = await insertComment(commentId, postId, commenterId, value.content);

    await sendEvent('post-events', {
      type: 'CommentAdded',
      postId,
      commentId,
      commenterId,
      postOwnerId: post.author_id
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await getCommentsByPostId(req.params.id);
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBatch = async (req, res) => {
  try {
    const { ids } = req.query;
    const userId = req.headers['x-user-id'] || null;
    if (!ids) return res.status(400).json({ error: 'Missing ids parameter' });

    const idArray = ids.split(',').filter(id => id.trim() !== '');
    if (idArray.length === 0) return res.json([]);

    const posts = await getPostsBatch(idArray, userId);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { authorId } = req.params;
    const userId = req.headers['x-user-id'] || null;
    const { limit } = req.query;
    const posts = await getRecentPostsByAuthor(authorId, parseInt(limit) || 20, userId);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createPost, getPost, deletePost, updatePost, likePost, unlikePost, addComment, getComments, getPostsBatch: getBatch, getUserPosts };
