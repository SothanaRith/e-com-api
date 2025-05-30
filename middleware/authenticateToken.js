const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { decrypt } = require('../utils/crypto');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized: No user info' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

//  Dynamic dot-access helper
const allowRole = {
  user: allowRoles('user'),
  vendor: allowRoles('vendor'),
  admin: allowRoles('admin'),
  vendorOrAdmin: allowRoles('vendor', 'admin'),
  userOrVendor: allowRoles('user', 'vendor'),
  userOrVendorOrAdmin: allowRoles('user', 'vendor', 'admin'),
};

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
      return res.status(401).json({ success: false, message: 'Token expired. Please re-login.'});
    }
    
    req.user = { id: user.id, role: user.role, roleId: user.roleId };
    next();
    
  } catch (error) {
    console.error('Error in authenticateToken:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token.', error: error.message });
  }
};
const vendorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (req.user.role !== 'vendor' || req.user.status !== 'approved') {
    return res.status(403).json({ message: 'Vendor access denied or not approved yet' });
  }
  
  next();
};
module.exports = { authenticateToken, allowRole, vendorOnly};
