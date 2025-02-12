const express = require('express');
const { sendMessage, getChatHistory, pinMessage, getActiveUsers } = require('../controllers/chatController');
const router = express.Router();

router.get('/history/:senderId/:receiverId', getChatHistory);
router.post('/send-message', sendMessage);
router.post('/pinMessage', pinMessage);
router.get('/active-users', getActiveUsers);

module.exports = router;
