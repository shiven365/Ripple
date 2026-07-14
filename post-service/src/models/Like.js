const pool = require('../config/db');

const insertLike = async (postId, userId) => {
  const existing = await pool.query('SELECT id FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
  if (existing.rows.length > 0) return existing.rows[0];
  const result = await pool.query(
    'INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING *',
    [postId, userId]
  );
  return result.rows[0];
};

const deleteLike = async (postId, userId) => {
  const result = await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING id', [postId, userId]);
  return result.rowCount > 0;
};

module.exports = { insertLike, deleteLike };
