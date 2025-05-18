const express = require('express');
const router = express.Router();
// Fix typo if any
const { registerVendor } = require('../controllers/vendorController');
const { approveVendor } = require('../controllers/adminController');
const { authenticateToken, allowRole } = require('../middleware/authenticateToken');
const adminController = require("../controllers/adminController");

// Vendor registration (public)
router.post('/vendor/register', registerVendor);

// Admin approves vendor (admin only)
router.post(
  '/approve/:vendorId',
  authenticateToken,            // verify token
  allowRole.admin,           // check admin role
  adminController.approveVendor
);

module.exports = router;
