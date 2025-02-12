const { User } = require('../models');

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

  exports.getProfile = async (req, res) => {
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