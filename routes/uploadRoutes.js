const express = require('express');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Endpoint to upload video or voice
router.post('/upload', uploadController.uploadFile);
router.delete('/delete/:filename', uploadController.deleteFile);

module.exports = router;
