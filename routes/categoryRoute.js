const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');

// Define the route to get all users
router.post('/create-category', categoryController.createCategory);

module.exports = router;