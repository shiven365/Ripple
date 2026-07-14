import client from './client';

export const followUser = async (userId) => {
  const { data } = await client.post(`/users/${userId}/follow`);
  return data;
};

export const getMe = async () => {
  const { data } = await client.get('/users/me');
  return data;
};

export const getProfile = async (userId) => {
  const { data } = await client.get(`/users/${userId}`);
  return data;
};

export const updateProfile = async (userId, profileData) => {
  const { data } = await client.put(`/users/${userId}`, profileData);
  return data;
};

export const unfollowUser = async (userId) => {
  const { data } = await client.delete(`/users/${userId}/follow`);
  return data;
};

export const searchUsers = async (query) => {
  const { data } = await client.get(`/users/search?q=${encodeURIComponent(query)}`);
  return data;
};

export const getFollowers = async (userId) => {
  const { data } = await client.get(`/users/${userId}/followers`);
  return data;
};

export const getFollowing = async (userId) => {
  const { data } = await client.get(`/users/${userId}/following`);
  return data;
};
