const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt, generateTokens } = require('../utils/crypto');
const Blacklist = require("../models/Blacklist");

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
    const encryptedToken = req.header('Authorization')?.split(' ')[1];

    if (!encryptedToken) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    let decryptedToken;
    let decoded;

    try {
      // Decrypt and verify token
      decryptedToken = decrypt(encryptedToken);
      console.log('Decrypted token:', decryptedToken);
      decoded = jwt.verify(decryptedToken, JWT_SECRET);
      if (!decoded.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Account not verified. Please complete OTP verification.',
        });
      }

    } catch (err) {
      // If token is expired, blacklist it
      if (err.name === 'TokenExpiredError') {
        const expiredDecoded = jwt.decode(decryptedToken);
        if (expiredDecoded) {
          await Blacklist.create({
            token: decryptedToken,
            expiresAt: new Date(expiredDecoded.exp * 1000),
          });
        }
      }
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Get user using decoded token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'hashedRefreshToken', 'passwordResetOtp', 'passwordResetExpires'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const filteredUser = Object.fromEntries(
        Object.entries(user.toJSON()).filter(([_, value]) => value !== null && value !== "")
    );

    return res.status(200).json({ success: true, filteredUser });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ success: false, message: 'Error fetching user profile', error: error.message });
  }
};

exports.updateUserById = async (req, res) => {
  const { id } = req.params;  // Get user ID from request parameters
  const { name, phone } = req.body;  // Extract fields to update from the request body

  try {
    // Find the user by their ID
    const user = await User.findByPk(id);

    // If user not found, return an error
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user fields
    await user.update({
      name: name || user.name,
      phone: phone || user.phone,
    });

            const { accessToken, refreshToken, hashedRefreshToken } = await generateTokens(user);
    user.hashedRefreshToken = hashedRefreshToken;


    // Respond with updated user data
    return res.status(200).json({ success: true, message: 'User updated successfully', accessToken, refreshToken });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;  // Get user ID from request parameters

  try {
    // Find the user by their ID
    const user = await User.findByPk(id);

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // If user not found, return an error
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Update user profile fields
    await user.update({
      coverImage: `/uploads/${file.filename}` || user.coverImage,
    });

        const { accessToken, refreshToken, hashedRefreshToken } = await generateTokens(user);
    user.hashedRefreshToken = hashedRefreshToken;

    // Respond with updated user profile data
    return res.status(200).json({ success: true, message: 'Profile updated successfully', accessToken, refreshToken });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};
