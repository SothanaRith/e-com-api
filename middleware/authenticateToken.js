const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { decrypt } = require('../utils/crypto');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  const encryptedToken = req.header('Authorization')?.split(' ')[1];

  if (!encryptedToken) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decryptedToken = decrypt(encryptedToken);
    const decoded = jwt.verify(decryptedToken, JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Token expired. Please re-login.' });
    }

    req.user = { id: user.id, role: user.role };
    next();

  } catch (error) {
    console.error('Error in authenticateToken:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token.', error: error.message });
  }
};

module.exports = { authenticateToken };
