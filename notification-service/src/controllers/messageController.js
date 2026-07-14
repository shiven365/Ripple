const { v4: uuidv4 } = require('uuid');
const { insertMessage, getMessagesBetween, getConversations } = require('../models/Message');
const { emitToUser } = require('../websocket/socketServer');

const sendMessage = async (req, res) => {
  try {
    const senderId = req.headers['x-user-id'] || req.body.userId;
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ error: 'Missing fields' });

    const messageId = uuidv4();
    const message = await insertMessage(messageId, senderId, receiverId, content);

    // Emit to receiver over websocket
    emitToUser(receiverId, 'chat_message', message);
    
    // Also emit to sender (for multi-device sync)
    emitToUser(senderId, 'chat_message', message);

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fetchMessages = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { otherUserId } = req.params;
    const messages = await getMessagesBetween(userId, otherUserId);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fetchConversations = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const conversations = await getConversations(userId);
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { sendMessage, fetchMessages, fetchConversations };
