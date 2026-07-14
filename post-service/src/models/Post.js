const pool = require('../config/db');

const insertPost = async (id, authorId, content, mediaUrl) => {
  const result = await pool.query(
    'INSERT INTO posts (id, author_id, content, media_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, authorId, content, mediaUrl]
  );
  return result.rows[0];
};

const getPostById = async (id, userId = null) => {
  const query = `
    SELECT p.*,
           (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id)::int AS likes,
           EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $2) AS is_liked_by_user
    FROM posts p
    WHERE p.id = $1
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};

const deletePostById = async (id, authorId) => {
  const result = await pool.query('DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING id', [id, authorId]);
  return result.rowCount > 0;
};

const updatePostById = async (id, authorId, content, mediaUrl) => {
  const result = await pool.query(
    'UPDATE posts SET content = COALESCE($1, content), media_url = COALESCE($2, media_url), updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND author_id = $4 RETURNING *',
    [content, mediaUrl, id, authorId]
  );
  return result.rows[0];
};

const getPostsBatch = async (ids, userId = null) => {
  const query = `
    SELECT p.*,
           (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id)::int AS likes,
           EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $2) AS is_liked_by_user
    FROM posts p
    WHERE p.id = ANY($1::uuid[])
  `;
  const result = await pool.query(query, [ids, userId]);
  return result.rows;
};

const getRecentPostsByAuthor = async (authorId, limit = 10, userId = null) => {
  const query = `
    SELECT p.*,
           (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id)::int AS likes,
           EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = $3) AS is_liked_by_user
    FROM posts p 
    WHERE p.author_id = $1 
    ORDER BY p.created_at DESC 
    LIMIT $2
  `;
  const result = await pool.query(query, [authorId, limit, userId]);
  return result.rows;
};

module.exports = { insertPost, getPostById, deletePostById, updatePostById, getPostsBatch, getRecentPostsByAuthor };
