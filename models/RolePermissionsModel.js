const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Your sequelize config

const RolePermissionModel = sequelize.define('RolePermissionModel', {
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Role',
      key: 'id',
    },
    onDelete: 'CASCADE', // Ensure the role is deleted when the role is removed
  },
  permissionId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'PermissionModel',
      key: 'id',
    },
    onDelete: 'CASCADE', // Ensure permission is deleted when the permission is removed
  },
});

module.exports = RolePermissionModel;
