const express = require('express');
const router = express.Router();
const controller = require('../controllers/deliveryAddressController');

router.post('/', controller.createAddress);
router.get('/user/:userId', controller.getUserAddresses);
router.put('/:id', controller.updateAddress);
router.delete('/:id', controller.deleteAddress);
router.get('/default/:userId', controller.getDefaultAddress);
module.exports = router;
