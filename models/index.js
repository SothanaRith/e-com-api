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
const Slide = require('./Slide');
const Transaction = require('./Transaction');
const Role = require('./Role');
const PermissionModel = require('./PermissionModel');

User.belongsToMany(Role, {through: 'UserRoles', foreignKey: 'userId', otherKey: 'roleId', as: 'roles',});
Role.belongsToMany(User, {through: 'UserRoles', foreignKey: 'roleId', otherKey: 'userId', as: 'users',});

// Role-Permission Many-to-Many
Role.belongsToMany(PermissionModel, {through: 'RolePermissions', foreignKey: 'roleId', otherKey: 'permissionId', as: 'permissions'});
PermissionModel.belongsToMany(Role, {through: 'RolePermissions', foreignKey: 'permissionId', otherKey: 'roleId', as: 'roles'});

// Chat associations
User.hasMany(Chat, { foreignKey: 'sender_id', as: 'SentMessages' });
User.hasMany(Chat, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
Chat.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Chat.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Review, { foreignKey: 'userId' });

// Wishlist associations
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'Wishlists', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Wishlist, { foreignKey: 'productId', onDelete: 'CASCADE' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

// Shop associations
User.hasMany(Shop, { foreignKey: 'vendorId', as: 'shops' });
Shop.belongsTo(User, { foreignKey: 'vendorId', as: 'vendor' });

// Category and Product associations
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Product - Review associations
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Product - Variant associations
Product.hasMany(Variant, { foreignKey: 'productId', onDelete: 'CASCADE' });
Variant.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

// Variant - VariantAttribute associations
Variant.hasMany(VariantAttribute, { foreignKey: 'variantId', onDelete: 'CASCADE' });
VariantAttribute.belongsTo(Variant, { foreignKey: 'variantId', onDelete: 'CASCADE' });

// Product - Cart associations
Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

// Variant - Cart associations
Variant.hasMany(Cart, { foreignKey: 'variantId' });
Cart.belongsTo(Variant, { foreignKey: 'variantId' });

// Order - User association
Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

// Order - OrderProduct associations (multi-product order)
Order.hasMany(OrderProduct, { foreignKey: 'orderId', as: 'orderItems' });
OrderProduct.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderProduct, { foreignKey: 'productId' });
OrderProduct.belongsTo(Product, { foreignKey: 'productId' });

Variant.hasMany(OrderProduct, { foreignKey: 'variantId' });
OrderProduct.belongsTo(Variant, { foreignKey: 'variantId' });

// Order - Transaction association
Order.hasOne(Transaction, { foreignKey: 'orderId' });
Transaction.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = {
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
    Shop,
    Slide,
    Transaction,
    Role,
    PermissionModel
};
