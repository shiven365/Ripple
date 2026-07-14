const pool = require('../config/db');

const insertFollow = async (followerId, followeeId) => {
  const result = await pool.query(
    'INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2) RETURNING id, follower_id, followee_id, created_at',
    [followerId, followeeId]
  );
  return result.rows[0];
};

const deleteFollow = async (followerId, followeeId) => {
  const result = await pool.query(
    'DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2 RETURNING id',
    [followerId, followeeId]
  );
  return result.rowCount > 0;
};

const listFollowers = async (userId) => {
  const result = await pool.query(
    `SELECT p.id, p.display_name, p.avatar_url, f.created_at as followed_at 
     FROM follows f 
     JOIN profiles p ON f.follower_id = p.id 
     WHERE f.followee_id = $1`,
    [userId]
  );
  return result.rows;
};

const listFollowing = async (userId) => {
  const result = await pool.query(
    `SELECT p.id, p.display_name, p.avatar_url, f.created_at as followed_at 
     FROM follows f 
     JOIN profiles p ON f.followee_id = p.id 
     WHERE f.follower_id = $1`,
    [userId]
  );
  return result.rows;
};

module.exports = { insertFollow, deleteFollow, listFollowers, listFollowing };
