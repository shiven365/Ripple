const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

const getFollowers = async (userId) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}/followers`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching followers for user ${userId}:`, error.message);
    return [];
  }
};

const getFollowing = async (userId) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}/following`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching following for user ${userId}:`, error.message);
    return [];
  }
};

module.exports = { getFollowers, getFollowing };
