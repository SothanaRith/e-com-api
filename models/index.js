const sequelize = require('../config/db');
const User = require('./User');
const Chat = require('./Chat');
const Product = require('./Product');
const Review = require('./Review')
const Category = require('./Category')

// Define associations here
User.hasMany(Chat, { foreignKey: 'sender_id', as: 'SentMessages' });
User.hasMany(Chat, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
Chat.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Chat.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });
Product.belongsTo(Category, { foreignKey: "categoryId", onDelete: "CASCADE" });
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });


// Export models for use
module.exports = { sequelize, User, Chat, Product, Category, Review  };