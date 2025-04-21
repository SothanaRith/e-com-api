const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt, generateTokens } = require('../utils/crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

exports.getAllUsers = async (req, res) => {
    try {
      // Fetch all users from the database
      const users = await User.findAll();
  
      // Respond with the user data
      res.status(200).json({ success: true, users });
    } catch (error) {
      // Handle errors and respond with a message
      res.status(500).json({ success: false, message: 'Error fetching users', error });
    }
};

exports.listUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password', 'activeToken', 'passwordResetOtp', 'passwordResetExpires'] },
      });
  
      res.status(200).json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching users', error });
    }
  };

  exports.getProfileById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'activeToken', 'passwordResetOtp', 'passwordResetExpires'] },
      });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const filteredUser = Object.fromEntries(
        Object.entries(user.toJSON()).filter(([key, value]) => value !== null && value !== "")
    );
  
      res.status(200).json({ success: true, filteredUser });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching user profile', error });
    }
  };

  exports.getProfile = async (req, res) => {
    try {
      // Extract the token from the Authorization header
      const token = req.header('Authorization')?.split(' ')[1];
  
      if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
      }
  
      // Verify and decode the token
      const decoded = jwt.verify(decrypt(token), JWT_SECRET);
      const userId = decoded.id;
  
      // Fetch user by decoded ID, excluding sensitive fields
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'activeToken', 'passwordResetOtp', 'passwordResetExpires'] },
      });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Filter out null or empty fields
      const filteredUser = Object.fromEntries(
        Object.entries(user.toJSON()).filter(([key, value]) => value !== null && value !== "")
      );
  
      res.status(200).json({ success: true, filteredUser });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ success: false, message: 'Error fetching user profile', error: error.message });
    }
  };