const Joi = require('joi');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const { sendEvent } = require('../kafka/producer');
const { 
  signAccessToken, 
  signRefreshToken, 
  hashRefreshToken,
  verifyRefreshToken,
  compareRefreshTokenHash
} = require('../services/tokenService');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).unknown(true);

const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    const result = await pool.query(
      'INSERT INTO credentials (id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
      [userId, email, passwordHash]
    );

    const user = result.rows[0];

    // Publish event
    await sendEvent('user-events', { type: 'UserRegistered', userId: user.id, email: user.email, username: value.username });

    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;
    
    const result = await pool.query('SELECT * FROM credentials WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    const refreshHash = await hashRefreshToken(refreshToken);

    await pool.query('UPDATE credentials SET refresh_token_hash = $1 WHERE id = $2', [refreshHash, user.id]);

    res.status(200).json({
      accessToken,
      refreshToken,
      expiresIn: 6 * 60 * 60 // 6 hours in seconds
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token is required' });

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return res.status(401).json({ error: 'Invalid or expired refresh token' });

    const result = await pool.query('SELECT * FROM credentials WHERE id = $1', [payload.userId]);
    const user = result.rows[0];

    if (!user || !user.refresh_token_hash) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const isValid = await compareRefreshTokenHash(refreshToken, user.refresh_token_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid refresh token' });

    // Rotate token
    const newAccessToken = signAccessToken(user.id);
    const newRefreshToken = signRefreshToken(user.id);
    const newRefreshHash = await hashRefreshToken(newRefreshToken);

    await pool.query('UPDATE credentials SET refresh_token_hash = $1 WHERE id = $2', [newRefreshHash, user.id]);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 6 * 60 * 60 // 6 hours in seconds
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    const { userId } = req.body; // Using request body for simplicity in testing
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    await pool.query('UPDATE credentials SET refresh_token_hash = NULL WHERE id = $1', [userId]);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { register, login, refresh, logout };
