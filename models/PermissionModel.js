const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust your path accordingly

const PermissionModel = sequelize.define('PermissionModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'Permissions',
  timestamps: true,       // add createdAt, updatedAt
});

module.exports = PermissionModel;
