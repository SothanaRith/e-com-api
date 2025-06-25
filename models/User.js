const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const  RoleModel = require('./Role');
const User = sequelize.define('Users', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
    validate: { isEmail: true },
  },
  tokenVersion: {
    type: DataTypes.STRING,
    default: 0,
  },
  hashedRefreshToken: { type: DataTypes.TEXT },
  coverImage: { type: DataTypes.TEXT },
  thumbnailImage: { type: DataTypes.TEXT },
  isVerify: { type: DataTypes.BOOLEAN, defaultValue: false },
  bio: { type: DataTypes.TEXT },
  statusTitle: { type: DataTypes.STRING },
  isMuted: { type: DataTypes.BOOLEAN, defaultValue: false },
  hasStory: { type: DataTypes.BOOLEAN, defaultValue: false },
  LatLong_lat: { type: DataTypes.DECIMAL(10, 7) },
  LatLong_long: { type: DataTypes.DECIMAL(10, 7) },
  isFriend: { type: DataTypes.BOOLEAN, defaultValue: false },
  isFollowing: { type: DataTypes.BOOLEAN, defaultValue: false },
  friendSince: { type: DataTypes.DATE },
  isFollower: { type: DataTypes.BOOLEAN, defaultValue: false },
  isBlock: { type: DataTypes.BOOLEAN, defaultValue: false },
  userQR: { type: DataTypes.STRING },
  
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  role: {
    type: DataTypes.ENUM("buyer", "seller", "vendor", "admin"),
    allowNull: false,
    defaultValue: "buyer"
  },
  
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Role', // TABLE NAME as string, NOT the Sequelize model variable
      key: 'id',
      
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'pending_approval', 'approved', 'rejected', 'active'),
    defaultValue: 'pending',
  },
  
  lastActive: { type: DataTypes.DATE, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  passwordResetOtp: { type: DataTypes.STRING, allowNull: true },
  passwordResetExpires: { type: DataTypes.DATE, allowNull: true },
  activeToken: { type: DataTypes.STRING, allowNull: true },
});

module.exports = User;
