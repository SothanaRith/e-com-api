const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('../models/User');
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false,
  },
  description: DataTypes.STRING,
}, {
  tableName: 'Role',
  timestamps: true,
});

module.exports = Role;
