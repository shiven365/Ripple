const pool = require('../config/db');

const insertMessage = async (id, senderId, receiverId, content) => {
  const result = await pool.query(
    'INSERT INTO messages (id, sender_id, receiver_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, senderId, receiverId, content]
  );
  return result.rows[0];
};

const getMessagesBetween = async (userId1, userId2) => {
  const result = await pool.query(
    `SELECT * FROM messages 
     WHERE (sender_id = $1 AND receiver_id = $2) 
        OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY created_at ASC`,
    [userId1, userId2]
  );
  return result.rows;
};

const getConversations = async (userId) => {
  const result = await pool.query(
    `SELECT DISTINCT ON (
       CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END,
       CASE WHEN sender_id < receiver_id THEN receiver_id ELSE sender_id END
     ) 
     id, sender_id, receiver_id, content, created_at
     FROM messages
     WHERE sender_id = $1 OR receiver_id = $1
     ORDER BY 
       CASE WHEN sender_id < receiver_id THEN sender_id ELSE receiver_id END,
       CASE WHEN sender_id < receiver_id THEN receiver_id ELSE sender_id END,
       created_at DESC`,
    [userId]
  );

  const rows = result.rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return rows;
};

module.exports = { insertMessage, getMessagesBetween, getConversations };
