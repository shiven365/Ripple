const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key';

const signAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '6h' });
};

const signRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const hashRefreshToken = async (token) => {
  return await bcrypt.hash(token, 10);
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_err) {
    return null;
  }
};

const compareRefreshTokenHash = async (token, hash) => {
  return await bcrypt.compare(token, hash);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
  compareRefreshTokenHash
};
