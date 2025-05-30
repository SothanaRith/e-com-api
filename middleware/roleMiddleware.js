const authenticateToken = require('./authenticateToken').authenticateToken; // Import token middleware

const isAdmin = (req, res, next) => {
  if (req.user.roleId !== 2) {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next(); // User is an admin, proceed to the route
};
const isSuperAdmin = (req, res, next) => {
  if (req.user.roleId !== 3) {
    return res.status(403).json({ message: 'Access denied: You must be a superadmin to manage permissions.' });
  }
  next();
};
const isBuyer = (req, res, next) => {
  if (req.user.roleId !== 1) {
    return res.status(403).json({ message: 'Access denied: You must be a buyer to manage permissions.' });
  }
  next();
};
const isVendor = (req, res, next) => {
  if (req.user.roleId !== 4) {
    return res.status(403).json({ message: 'Access denied: You must be a vendor to manage permissions.' });
  }
  next();
};
module.exports = { isAdmin, isSuperAdmin, isBuyer, isVendor, authenticateToken };