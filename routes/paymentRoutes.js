const express = require('express');
const paymentController = require('../controllers/paymentController');
const khqrController = require('../services/paymentService');

const router = express.Router();

// Route to generate deeplink
router.post('/generate-deeplink', paymentController.generateDeeplink);

// Route to check transaction status by MD5
router.post('/check-transaction-md5', paymentController.checkTransactionStatus);

router.post('/check-stream-transaction', paymentController.checkStreamTransactionStatus);

router.post('/generate-khqr', khqrController.generateKHQR);

// Route to verify a KHQRx
router.post('/verify', khqrController.verifyKHQR);

// Route to decode a KHQR
router.post('/decode', khqrController.decodeKHQR);
router.post('/deeplink', khqrController.deeplink);
router.post('/renew-token', khqrController.renewToken);
router.post('/process-transaction', paymentController.handleTransaction);
module.exports = router;
