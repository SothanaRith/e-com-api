const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require('./User'); // vendor user model

const Shop = sequelize.define('Shop', {
  name: { type: DataTypes.STRING, allowNull: false },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE',
  },
  description: { type: DataTypes.TEXT },
  address: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  coverImage: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  // other shop-specific fields here
});

// Association: One vendor has many shops
// Shop.belongsTo(User, { foreignKey: 'vendorId', as: 'vendor' });
// User.hasMany(Shop, { foreignKey: 'vendorId', as: 'shops' });

module.exports = Shop;
