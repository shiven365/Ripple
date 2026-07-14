const axios = require('axios');

const POST_SERVICE_URL = process.env.POST_SERVICE_URL || 'http://localhost:3002';

const getPostsBatch = async (postIds, userId = null) => {
  if (!postIds || postIds.length === 0) return [];
  const idsString = postIds.join(',');
  try {
    const headers = userId ? { 'x-user-id': userId } : {};
    const response = await axios.get(`${POST_SERVICE_URL}/posts/batch?ids=${idsString}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts batch:', error.message);
    return [];
  }
};

const getRecentPostsByAuthor = async (authorId, limit = 10, userId = null) => {
  try {
    const headers = userId ? { 'x-user-id': userId } : {};
    const response = await axios.get(`${POST_SERVICE_URL}/posts/user/${authorId}?limit=${limit}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for author ${authorId}:`, error.message);
    return [];
  }
};

module.exports = { getPostsBatch, getRecentPostsByAuthor };
