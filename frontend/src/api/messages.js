import client from './client';

export const getConversations = async () => {
  const { data } = await client.get('/messages/conversations');
  return data;
};

export const getMessages = async (otherUserId) => {
  const { data } = await client.get(`/messages/${otherUserId}`);
  return data;
};

export const sendMessage = async (receiverId, content) => {
  const { data } = await client.post('/messages', { receiverId, content });
  return data;
};
