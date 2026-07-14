const pool = require('../config/db');

const getProfileById = async (id) => {
  const result = await pool.query('SELECT id, display_name, bio, avatar_url, created_at FROM profiles WHERE id = $1', [id]);
  return result.rows[0];
};

const updateProfile = async (id, { display_name, bio, avatar_url }) => {
  const result = await pool.query(
    `UPDATE profiles 
     SET display_name = COALESCE($1, display_name), 
         bio = COALESCE($2, bio), 
         avatar_url = COALESCE($3, avatar_url) 
     WHERE id = $4 RETURNING id, display_name, bio, avatar_url, created_at`,
    [display_name, bio, avatar_url, id]
  );
  return result.rows[0];
};
const searchProfiles = async (query) => {
  const result = await pool.query(
    'SELECT id, display_name, bio, avatar_url, created_at FROM profiles WHERE display_name ILIKE $1 LIMIT 20', 
    [`%${query}%`]
  );
  return result.rows;
};

const createProfile = async (id, display_name = 'User') => {
  const result = await pool.query(
    'INSERT INTO profiles (id, display_name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING RETURNING id, display_name, bio, avatar_url, created_at',
    [id, display_name]
  );
  if (result.rows.length > 0) return result.rows[0];
  return await getProfileById(id);
};

module.exports = { getProfileById, updateProfile, searchProfiles, createProfile };
