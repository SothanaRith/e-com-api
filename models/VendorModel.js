const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VendorModel = sequelize.define('VendorModel', {
  vendorId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {  // Link to User account
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  shopName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shopDescription: {
    type: DataTypes.TEXT,
  },
  status: {  // approval status: pending, approved, rejected
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'Vendors',
  timestamps: true,
});

module.exports = VendorModel;
