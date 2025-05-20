const sequelize = require('../config/db');
const User = require('./User');
const Chat = require('./Chat');
const Product = require('./Product');
const Review = require('./Review');
const Category = require('./Category');
const Wishlist = require('./WishList');
const Order = require('./Order');
const OrderProduct = require('./OrderProduct');
const Variant = require('./VariantModel');
const VariantAttribute = require('./VariantAttributeModel');
const Cart = require('./Cart');
const Shop = require('./Shop');

// Define associations

// Chat associations
User.hasMany(Chat, { foreignKey: 'sender_id', as: 'SentMessages' });
User.hasMany(Chat, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
Chat.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Chat.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

// Review associations (corrected foreignKey to 'userId')
Review.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Review, { foreignKey: 'userId' });

// Wishlist associations (added 'as' alias for consistency)
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'Wishlists', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'Wishlists', onDelete: 'CASCADE' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Shop associations (added 'as' for consistency)
User.hasMany(Shop, { foreignKey: 'vendorId', as: 'shops' });
Shop.belongsTo(User, { foreignKey: 'vendorId', as: 'vendor' });

// Category and Product associations
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Product - Review associations
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Product - OrderProduct associations
Product.hasMany(OrderProduct, { foreignKey: 'productId' });
OrderProduct.belongsTo(Product, { foreignKey: 'productId' });

// Variant and Product associations
Product.hasMany(Variant, { foreignKey: 'productId', onDelete: 'CASCADE' });
Variant.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

// VariantAttribute associations with Variant
Variant.hasMany(VariantAttribute, { foreignKey: 'variantId', onDelete: 'CASCADE' });
VariantAttribute.belongsTo(Variant, { foreignKey: 'variantId', onDelete: 'CASCADE' });

// Product and Cart associations
Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

Variant.hasMany(Cart, { foreignKey: 'variantId' });
Cart.belongsTo(Variant, { foreignKey: 'variantId' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId' });
Order.belongsTo(Product, { foreignKey: 'productId' });
Order.belongsTo(Variant, { foreignKey: 'variantId' });

// Export models for use
const models = {
    sequelize,
    User,
    Chat,
    Product,
    Category,
    Review,
    Wishlist,
    OrderProduct,
    Order,
    Variant,
    VariantAttribute,
    Cart,
    Shop, // Add Shop model here
};

Object.values(models).forEach(model => {
    if (typeof model.associate === 'function') {
        model.associate(models);
    }
});

module.exports = models;
