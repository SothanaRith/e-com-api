// controllers/vendorController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.registerVendor = async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    
    // Create user with role vendor, status pending
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'vendor',
      status: 'pending',
      passwordResetOtp: hashedOtp,
      passwordResetExpires: otpExpires,
    });
    
    // Send OTP email
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Vendor Registration OTP',
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`
    });
    
    res.status(201).json({ message: 'Registered successfully. Verify OTP sent to email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering vendor' });
  }
};
// exports.verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;
//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(400).json({ message: 'User not found' });
//     if (user.status !== 'pending') return res.status(400).json({ message: 'User already verified or rejected' });
//
//     const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
//
//     if (user.passwordResetOtp !== hashedOtp || user.passwordResetExpires < new Date()) {
//       return res.status(400).json({ message: 'Invalid or expired OTP' });
//     }
//
//     user.status = 'pending'; // next step waiting for admin
//     user.passwordResetOtp = null;
//     user.passwordResetExpires = null;
//     await user.save();
//
//     res.json({ message: 'OTP verified. Wait for admin approval.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error verifying OTP' });
//   }
// };



const { generateTokens } = require('../utils/crypto'); // Assuming you have a helper to generate tokens


exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;  // User sends email and OTP
  
  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Ensure the status is 'pending' to verify OTP (validating vendor registration process)
    if (user.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'User status is not pending' });
    }
    
    // Hash the submitted OTP for comparison
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Check if OTP is valid and not expired
    if (user.passwordResetOtp !== hashedOtp || user.passwordResetExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // OTP verified, now generate access and refresh tokens
    const { accessToken, refreshToken, hashedRefreshToken } = await generateTokens(user);
    
    // Clear OTP data after successful verification
    user.passwordResetOtp = null;
    user.passwordResetExpires = null;
    user.status = 'pending_approval';  // Change status to pending_approval
    await user.save();
    
    // Send back access & refresh tokens
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      accessToken,
      refreshToken,
    });
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

