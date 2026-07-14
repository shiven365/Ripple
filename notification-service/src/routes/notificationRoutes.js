const express = require('express');
const { listNotifications, markRead, getOnlineUsers } = require('../controllers/notificationController');

const router = express.Router();

router.get('/online', getOnlineUsers);
router.get('/', listNotifications);
router.put('/:id/read', markRead);

module.exports = router;
