const express = require('express');
const { register, login, sendOtpForReset, verifyOtp, refreshToken, resetPassword, logout } = require('../controllers/authController');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken'); // Assuming you put it in `authMiddleware.js`
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `windowMs`
  message: 'Too many login attempts, please try again later.',
});

router.post('/register', register);
router.post('/login', login, loginLimiter);
router.post('/send-otp', authenticateToken, sendOtpForReset);
router.post('/verify-otp', authenticateToken, verifyOtp);
router.post('/refresh-token', authenticateToken, refreshToken);
router.post('/reset-password', authenticateToken, resetPassword);
router.post('/logout', authenticateToken, logout);

router.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ success: true, message: 'You have access to this route', user: req.user });
  });
module.exports = router;
