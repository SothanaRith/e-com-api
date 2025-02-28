const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define the route to get all users
router.post('/create-product', productController.createProduct);
router.get('/get-products', productController.getAllProduct);
router.post('/get-product', productController.getProductById);
module.exports = router;