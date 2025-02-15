const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Chat = require('./Chat');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // Ensures the email is unique
    validate: {
      isEmail: true,  // Validates the email format
    },
  },
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
  
  password: { type: DataTypes.STRING, allowNull: false }, // Hashed password
  phone: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: 'buyer' }, // buyer, seller, admin
  status: { type: DataTypes.STRING, defaultValue: 'active' }, // active, deactivated
  lastActive: { type: DataTypes.DATE, allowNull: true }, // New field to track last active time
  passwordResetOtp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  activeToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = User;
