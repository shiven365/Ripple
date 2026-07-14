const express = require('express');
const {
  createPost,
  getPost,
  deletePost,
  updatePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  getPostsBatch,
  getUserPosts
} = require('../controllers/postController');
const { createStory, fetchStories } = require('../controllers/storyController');

const router = express.Router();

router.get('/batch', getPostsBatch);
router.get('/user/:authorId', getUserPosts);

router.get('/stories', fetchStories);
router.post('/stories', createStory);

router.post('/', createPost);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);
router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);

module.exports = router;
