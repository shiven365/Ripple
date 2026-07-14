const pool = require('../config/db');
const { getActiveUsers } = require('../websocket/socketServer');

const listNotifications = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const result = await pool.query(
      'SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markRead = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_id = $2 RETURNING *',
      [req.params.id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOnlineUsers = (req, res) => {
  try {
    const online = getActiveUsers();
    res.json(online);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { listNotifications, markRead, getOnlineUsers };
