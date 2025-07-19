const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User'); // Import User model

const Chat = sequelize.define('Chat', {
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the user sending the message'
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the user receiving the message'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Text message content'
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL of uploaded video/voice file'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Time when message was sent'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Message read status'
  },
  pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Message is pinned or not'
  },
  pinned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User ID who pinned the message'
  }
}, {
  tableName: 'chats',
  charset: 'utf8mb4',  // Emoji support
  collate: 'utf8mb4_unicode_ci',
  timestamps: true,    // adds createdAt & updatedAt
  paranoid: true,      // adds deletedAt (soft deletes)
  indexes: [
    { fields: ['sender_id'] },
    { fields: ['receiver_id'] },
    { fields: ['is_read'] }
  ]
});

// Associations
Chat.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });
Chat.belongsTo(User, { as: 'receiver', foreignKey: 'receiver_id' });

module.exports = Chat;
