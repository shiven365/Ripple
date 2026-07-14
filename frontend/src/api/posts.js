import client from './client';

export const createPost = async (postData) => {
  const { data } = await client.post('/posts', postData);
  return data;
};

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const getUserPosts = async (authorId) => {
  const { data } = await client.get(`/posts/user/${authorId}`);
  return data;
};

export const updatePost = async (id, postData) => {
  const { data } = await client.put(`/posts/${id}`, postData);
  return data;
};

export const deletePost = async (id) => {
  const { data } = await client.delete(`/posts/${id}`);
  return data;
};

export const likePost = async (postId) => {
  const { data } = await client.post(`/posts/${postId}/like`);
  return data;
};

export const unlikePost = async (postId) => {
  const { data } = await client.delete(`/posts/${postId}/like`);
  return data;
};

export const addComment = async (id, content) => {
  const { data } = await client.post(`/posts/${id}/comments`, { content });
  return data;
};

export const getComments = async (id) => {
  const { data } = await client.get(`/posts/${id}/comments`);
  return data;
};

export const createStory = async (mediaUrl) => {
  const { data } = await client.post('/posts/stories', { mediaUrl });
  return data;
};

export const getStories = async (authorIds) => {
  if (!authorIds || authorIds.length === 0) return [];
  const { data } = await client.get(`/posts/stories?authorIds=${authorIds.join(',')}`);
  return data;
};
