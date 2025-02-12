const authenticateToken = require('./authenticateToken').authenticateToken; // Import token middleware

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next(); // User is an admin, proceed to the route
};

module.exports = { isAdmin };