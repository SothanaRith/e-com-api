const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authenticateToken'); // Assuming you put it in `authMiddleware.js`
const upload = process.env.NODE_ENV === 'production'
    ? require('../middleware/s3Upload') : require('../utils/fileUpload');

// Define the route to get all users
router.get('/getUsers',userController.getAllUsers);
router.get('/getProfile/:id', userController.getProfileById);
router.get('/getProfile',authenticateToken, userController.getProfile);
router.post('/updateProfile/:id', userController.updateUserById);  // Update a user by ID
router.post('/updateProfilePicture/:id', upload.single('profilePicture'), userController.updateProfile);  // Update a user by ID

module.exports = router;
