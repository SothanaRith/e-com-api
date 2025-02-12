const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { decrypt } = require('../utils/crypto');
const Blacklist = require('../models/Blacklist');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  const encryptedToken = req.header('Authorization')?.split(' ')[1];

  if (!encryptedToken) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decryptedToken = decrypt(encryptedToken);
    const hashedToken = crypto.createHash('sha256').update(decryptedToken).digest('hex');

    const blacklisted = await Blacklist.findOne({ where: { token: hashedToken } });
    if (blacklisted) {
      return res.status(401).json({ success: false, message: 'Token is invalidated.' });
    }

    const decoded = jwt.verify(decryptedToken, JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (error) {
    console.error('Error in authenticateToken:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token.', error: error.message });
  }
};

module.exports = { authenticateToken };
