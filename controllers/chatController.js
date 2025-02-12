
const { Op } = require('sequelize');
const { Chat, User } = require('../models');


exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, message, fileUrl } = req.body;

  try {
    // Validate input data
    if (!senderId || !receiverId || (!message && !fileUrl)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sender, receiver, and at least one of message or file URL are required' 
      });
    }

    // Ensure both sender and receiver exist
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sender or receiver not found' 
      });
    }

    // Validate fileUrl (if provided)
    if (fileUrl) {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', // Image
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm',
        '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.amr'];
      const fileExtension = fileUrl.substring(fileUrl.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid file type. Supported types are: images, videos, and audio files.' 
        });
      }
    }

    // Create the chat entry
    const chat = await Chat.create({
      sender_id: senderId,
      receiver_id: receiverId,
      message: message || '', // Default to empty string if no message
      file_url: fileUrl || null, // Default to null if no file
    });

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully', 
      chat 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending message', 
      error: error.message 
    });
  }
};


exports.getChatHistory = async (req, res) => {
  const { senderId, receiverId } = req.params;
  const { page = 1, limit = 20 } = req.query; // Default to 20 messages per page

  try {
    const offset = (page - 1) * limit;
    const chatHistory = await Chat.findAll({
      where: {
        [Op.or]: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
        ],
      },
      order: [['timestamp', 'ASC']],
      limit: parseInt(limit, 10),
      offset,
    });

    res.status(200).json({ success: true, chatHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chat history', error });
  }
};

exports.getUnreadMessageCount = async (req, res) => {
  const { userId } = req.params;

  try {
    const unreadCount = await Chat.count({
      where: {
        receiver_id: userId,
        is_read: false,
      },
    });

    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching unread message count', error });
  }
};
exports.pinMessage = async (req, res) => {
  const { chatId, userId, pin } = req.body; // `pin` is a boolean to pin or unpin

  try {
    // Validate input
    if (!chatId || userId === undefined || pin === undefined) {
      return res.status(400).json({ success: false, message: 'chatId, userId, and pin are required' });
    }

    // Find the chat message
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Find the user who is pinning/unpinning
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update the chat message
    chat.pinned = pin;
    chat.pinned_by = pin ? userId : null;
    await chat.save();

    res.status(200).json({
      success: true,
      message: `Message ${pin ? 'pinned' : 'unpinned'} successfully`,
      chat,
    });
  } catch (error) {
    console.error('Error pinning message:', error);
    res.status(500).json({ success: false, message: 'Error pinning message', error: error.message });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const threshold = new Date(new Date() - 5 * 60 * 1000); // 5 minutes ago
    const activeUsers = await User.findAll({
      where: {
        lastActive: { [Op.gt]: threshold },
      },
      attributes: ['id', 'name', 'email', 'lastActive'],
    });

    res.status(200).json({
      success: true,
      activeUsers,
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active users',
      error: error.message,
    });
  }
};