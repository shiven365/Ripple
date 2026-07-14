import client from './client';

export const login = async (credentials) => {
  const { data } = await client.post('/auth/login', credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await client.post('/auth/register', userData);
  return data;
};
