const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/venderController');

router.get('/vendors', vendorController.getAllVendors);
router.get('/vendors/:id', vendorController.getVendorById);
router.post('/vendors', vendorController.createVendor);
router.put('/vendors/:id', vendorController.updateVendor);
router.delete('/vendors/:id', vendorController.deleteVendor);

module.exports = router;
