const express = require('express');
const { sendMessage, getChatHistory, pinMessage, getActiveUsers } = require('../controllers/chatController');
const { chatWithBot, clearChatHistory, chatTuboWithBot } = require("../controllers/gptChatController");
const router = express.Router();

router.get('/history/:senderId/:receiverId', getChatHistory);
router.post('/send-message', sendMessage);
router.post('/pinMessage', pinMessage);
router.get('/active-users', getActiveUsers);

router.post("/chat", chatWithBot);
router.post("/chat-tubo", chatTuboWithBot);
router.post("/clear", clearChatHistory);

module.exports = router;
