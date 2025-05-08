const sequelize = require('../config/db');
const User = require('./User');
const Chat = require('./Chat');
const Product = require('./Product');
const Review = require('./Review')
const Category = require('./Category')
const Order = require('./Order')
const OrderProduct = require('./OrderProduct')
const Variant = require('./VariantModel')
const VariantAttribute = require('./VariantAttributeModel')
const Cart = require('./Cart')

// Define associations here
User.hasMany(Chat, { foreignKey: 'sender_id', as: 'SentMessages' });
User.hasMany(Chat, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
Chat.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Chat.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

Review.belongsTo(User, { foreignKey: 'id', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Review, { foreignKey: 'id' });

Category.hasMany(Product, { foreignKey: 'categoryId' })
Product.belongsTo(Category, { foreignKey: 'categoryId' })

Product.hasMany(Review, { foreignKey: "productId", onDelete: "CASCADE" });
Review.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });
Product.hasMany(OrderProduct, { foreignKey: "productId" });
OrderProduct.belongsTo(Product, { foreignKey: "productId" });

// variant and product response
Product.hasMany(Variant, { foreignKey: "productId", onDelete: "CASCADE" }); // Define association
Variant.hasMany(VariantAttribute, { foreignKey: "variantId", onDelete: "CASCADE" }); // Define association
VariantAttribute.belongsTo(Variant, { foreignKey: "variantId", onDelete: "CASCADE" });
Variant.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });

// Define Relationships
Product.hasMany(Variant, { foreignKey: "productId" });
Variant.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(Cart, { foreignKey: "productId" });
Cart.belongsTo(Product, { foreignKey: "productId" });

Variant.hasMany(Cart, { foreignKey: "variantId" });
Cart.belongsTo(Variant, { foreignKey: "variantId" });

Order.belongsTo(User, { foreignKey: "userId" });
Order.belongsTo(Product, { foreignKey: "productId" });
Order.belongsTo(Variant, { foreignKey: "variantId" });


// Export models for use
module.exports = { sequelize, User, Chat, Product, Category, Review, OrderProduct, Order};