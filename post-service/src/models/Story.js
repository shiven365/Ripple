const pool = require('../config/db');

const insertStory = async (id, authorId, mediaUrl) => {
  const result = await pool.query(
    'INSERT INTO stories (id, author_id, media_url) VALUES ($1, $2, $3) RETURNING *',
    [id, authorId, mediaUrl]
  );
  return result.rows[0];
};

const getActiveStoriesByAuthors = async (authorIds) => {
  if (!authorIds || authorIds.length === 0) return [];
  const result = await pool.query(
    `SELECT * FROM stories 
     WHERE author_id = ANY($1) AND expires_at > CURRENT_TIMESTAMP 
     ORDER BY created_at ASC`,
    [authorIds]
  );
  return result.rows;
};

module.exports = { insertStory, getActiveStoriesByAuthors };
