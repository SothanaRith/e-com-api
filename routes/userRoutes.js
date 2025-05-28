const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authenticateToken'); // Assuming you put it in `authMiddleware.js`

// Define the route to get all users
router.get('/getUsers',userController.getAllUsers);
router.get('/getProfile/:id', userController.getProfileById);
router.get('/getProfile',authenticateToken, userController.getProfile);

module.exports = router;
