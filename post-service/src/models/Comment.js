const pool = require('../config/db');

const insertComment = async (id, postId, userId, content) => {
  const result = await pool.query(
    'INSERT INTO comments (id, post_id, user_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, postId, userId, content]
  );
  return result.rows[0];
};

const getCommentsByPostId = async (postId) => {
  const result = await pool.query(
    'SELECT id, post_id, user_id as author_id, content, created_at FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
    [postId]
  );
  return result.rows;
};

module.exports = { insertComment, getCommentsByPostId };
