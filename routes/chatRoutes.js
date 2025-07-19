const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// GET /api/chats?senderId=1&receiverId=2
router.get('/', chatController.getMessages);

// POST /api/chats
router.post('/', chatController.sendMessage);

// PUT /api/chats/mark-as-read
router.put('/mark-as-read', chatController.markAsRead);

// PUT /api/chats/pin
router.put('/pin', chatController.pinMessage);

router.get('/chats-and-contacts', chatController.getChatsAndContacts);

module.exports = router;
