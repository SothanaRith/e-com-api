const express = require('express');
const service = require('../controllers/serviceController')
const router = express.Router();

router.get('/convert-video/gif/:filename', service.convertVideoToGif);

module.exports = router;
