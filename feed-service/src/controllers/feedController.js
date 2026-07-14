const { getFeed, addToFeed, trimFeed } = require('../redis/feedStore');
const { getPostsBatch } = require('../clients/postServiceClient');
const { getFollowing } = require('../clients/userServiceClient');

const fetchFeed = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const cursor = parseInt(req.query.cursor) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const postIds = await getFeed(userId, cursor, limit);
    
    if (postIds.length === 0) {
      return res.json({ items: [], nextCursor: null });
    }

    const posts = await getPostsBatch(postIds, userId);

    // Merge and maintain order
    const postMap = {};
    posts.forEach(p => postMap[p.id] = p);
    
    const items = postIds.map(id => postMap[id]).filter(p => p != null);

    const nextCursor = postIds.length === limit ? cursor + limit : null;

    res.json({ items, nextCursor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const rebuildFeed = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    // 1. Get everyone they follow
    const following = await getFollowing(userId);
    
    const authorIds = following.map(f => f.id || f.followee_id);

    const { getRecentPostsByAuthor } = require('../clients/postServiceClient');
    
    let totalAdded = 0;
    
    for (const authorId of authorIds) {
      if (!authorId) continue;
      const recentPosts = await getRecentPostsByAuthor(authorId, 10, userId);
      for (const post of recentPosts) {
        await addToFeed(userId, post.id, post.created_at);
        totalAdded++;
      }
    }
    
    // Trim feed to ensure it doesn't grow unbounded
    await trimFeed(userId);
    
    res.json({ message: `Feed rebuilt successfully. Added ${totalAdded} recent posts.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { fetchFeed, rebuildFeed };
