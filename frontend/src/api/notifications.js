import client from './client';

export const getNotifications = async () => {
  const { data } = await client.get('/notifications');
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await client.put(`/notifications/${id}/read`);
  return data;
};

export const getOnlineUsers = async () => {
  const { data } = await client.get('/notifications/online');
  return data;
};
