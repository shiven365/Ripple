const express = require('express');
const { sendMessage, fetchMessages, fetchConversations } = require('../controllers/messageController');

const router = express.Router();

router.get('/conversations', fetchConversations);
router.get('/:otherUserId', fetchMessages);
router.post('/', sendMessage);

module.exports = router;
