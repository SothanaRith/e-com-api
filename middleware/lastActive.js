const User = require('../models/User');

const updateLastActive = async (req, res, next) => {
  try {
    const userId = req.userId; // Assume `userId` is set after authentication middleware
    if (userId) {
      await User.update(
        { lastActive: new Date() },
        { where: { id: userId } }
      );
    }
    next();
  } catch (error) {
    console.error('Error updating last active:', error);
    next();
  }
};

module.exports = updateLastActive;
