// const express = require('express');
// const router = express.Router();
// const vendorController = require('../controllers/venderController');
//
// router.get('/vendors', vendorController.getAllVendors);
// router.get('/vendors/:id', vendorController.getVendorById);
// router.post('/vendors', vendorController.createVendor);
// router.put('/vendors/:id', vendorController.updateVendor);
// router.delete('/vendors/:id', vendorController.deleteVendor);
//
// module.exports = router;

const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authenticateToken'); // JWT auth middleware
const { allowRole, vendorOnly, authenticateToken} = require('../middleware/authenticateToken'); // Assuming you have these

// Public routes
router.post('/register', vendorController.registerVendor);
router.post('/verify-otp', vendorController.verifyOtp);

router.get(
  '/dashboard',
  authenticateToken,
  vendorOnly,                // vendor-only middleware to check role + approval
  (req, res) => {
    res.json({ message: 'Welcome vendor!' });
  }
);

module.exports = router;

