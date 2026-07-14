import client from './client';

export const getFeed = async (cursor = null, limit = 20) => {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  if (limit) params.append('limit', limit);
  const { data } = await client.get(`/feed?${params.toString()}`);
  return data;
};
