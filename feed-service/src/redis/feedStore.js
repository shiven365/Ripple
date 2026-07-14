const { createClient } = require('redis');

const client = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

client.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
  await client.connect();
  console.log('Connected to Redis');
};

const addToFeed = async (userId, postId, timestamp) => {
  const score = new Date(timestamp).getTime();
  await client.zAdd(`feed:${userId}`, { score, value: postId });
};

const getFeed = async (userId, offset = 0, limit = 20) => {
  const postIds = await client.zRange(`feed:${userId}`, '+inf', '-inf', {
    BY: 'SCORE',
    REV: true,
    LIMIT: {
      offset,
      count: limit
    }
  });
  return postIds;
};

const trimFeed = async (userId) => {
  // Keep only the latest 500 entries. 
  // Rank 0 is the lowest score (oldest). We want to remove from 0 to -501.
  await client.zRemRangeByRank(`feed:${userId}`, 0, -501);
};

module.exports = { connectRedis, addToFeed, getFeed, trimFeed };
