const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Chat = sequelize.define('Chat', {
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: true }, // Text message
  file_url: { type: DataTypes.STRING, allowNull: true }, // URL of the uploaded video or voice
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false }, // Read status
  pinned: { type: DataTypes.BOOLEAN, defaultValue: false }, // New field for pinning
  pinned_by: { type: DataTypes.INTEGER, allowNull: true }, // User ID who pinned the message
}, {
  charset: 'utf8mb4',  // Ensure emoji support
  collate: 'utf8mb4_unicode_ci',
});

module.exports = Chat;