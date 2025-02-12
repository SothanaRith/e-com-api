const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define the route to get all users
router.get('/getUsers', userController.getAllUsers);
router.get('/getProfile/:id', userController.getProfile);

module.exports = router;
