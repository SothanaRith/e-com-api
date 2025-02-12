const sequelize = require('../config/db');
const User = require('./User');
const Chat = require('./Chat');

// Define associations here
User.hasMany(Chat, { foreignKey: 'sender_id', as: 'SentMessages' });
User.hasMany(Chat, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
Chat.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Chat.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

// Export models for use
module.exports = { sequelize, User, Chat };