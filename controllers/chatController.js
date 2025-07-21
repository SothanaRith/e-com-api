
const User = require('../models/User')
const Chat = require('../models/Chat')
const { Op } = require('sequelize');

// Get all messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'senderId and receiverId are required' });
    }

    const messages = await Chat.findAll({
      where: {
        [Op.or]: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId }
        ]
      },
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'receiver' }
      ],
      order: [['timestamp', 'ASC']]
    });

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, message, file_url } = req.body;

    if (!sender_id || !receiver_id || (!message && !file_url)) {
      return res.status(400).json({ error: 'sender_id, receiver_id and message/file_url are required' });
    }

    // Create a new message chat
    const newMessage = await Chat.create({
      sender_id,
      receiver_id,
      message,
      file_url
    });

    // Fetch the updated chat with sender and receiver details
    const updatedChat = await Chat.findOne({
      where: { id: newMessage.id },
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'receiver' }
      ]
    });

    return res.status(201).json(updatedChat);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    await Chat.update(
        { is_read: true },
        {
          where: {
            sender_id: senderId,
            receiver_id: receiverId,
            is_read: false
          }
        }
    );

    return res.json({ message: 'Messages marked as read' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Pin a message
exports.pinMessage = async (req, res) => {
  try {
    const { messageId, userId } = req.body;

    const chat = await Chat.findByPk(messageId);
    if (!chat) return res.status(404).json({ error: 'Message not found' });

    await chat.update({ pinned: true, pinned_by: userId });

    return res.json({ message: 'Message pinned', chat });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getChatsAndContacts = async (req, res) => {
  try {
    const searchQuery = req.query.q || '';  // If there's a search query
    const chats = await Chat.findAll({
      include: [
        { model: User, as: 'sender', attributes: {exclude: ["password", "phone", "hashedRefreshToken", "roleId"]} },
        { model: User, as: 'receiver', attributes: {exclude: ["password", "phone", "hashedRefreshToken", "roleId"]} }
      ],
      where: {
        [Op.or]: [
          { '$sender.name$': { [Op.like]: `%${searchQuery}%` } },  // Changed 'fullName' to 'name'
          { '$receiver.name$': { [Op.like]: `%${searchQuery}%` } }  // Changed 'fullName' to 'name'
        ]
      },
    });

    const contacts = await User.findAll({
      where: { name: { [Op.like]: `%${searchQuery}%` } }  // Changed 'fullName' to 'name'
    });

    const profileUser = await User.findOne({
      where: { id: req.query.userId }  // Adjust based on your user auth system
    });

    return res.json({
      chatsContacts: chats,
      contacts: contacts,
      profileUser: profileUser
    });
  } catch (error) {
    console.error('Error fetching chats and contacts:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
};