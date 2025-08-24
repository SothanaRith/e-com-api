const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { encrypt, decrypt, generateTokens } = require('../utils/crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Blacklist = require('../models/Blacklist');
const {OAuth2Client} = require("google-auth-library");
const { log } = require('console');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already registered.',
      });
    }

    // Hash Password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create User with tokenVersion default = 0
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      tokenVersion: 0,             // Important
      hashedRefreshToken: '',      // Placeholder for later
    });

    // Generate Tokens (Auto update tokenVersion & hashedRefreshToken inside)
    const { accessToken, refreshToken } = await generateTokens(newUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify OTP.',
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Error during registration:', error);

    return res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message || error,
    });
  }
};

exports.googleLogin = async (req, res) => {

  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account has no email' });
    }

    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Register new user
      user = await User.create({
        name: name || "Google User",
        email,
        password: '',
        phone: '',
        role: 'buyer',
        isVerify: true,
        status: 'active',
        tokenVersion: 0,
        hashedRefreshToken: '',
        googleId: sub,
      });
    } else {
      // If user exists but banned/inactive
      if (user.status === 'banned') {
        return res.status(403).json({ success: false, message: 'Your account is banned' });
      }
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    return res.status(200).json({
      success: true,
      message: user.createdAt === user.updatedAt
          ? 'Google registration successful'
          : 'Google login successful',
      status: user.password === ''
          ? 'register'
          : 'login',
      accessToken,
      refreshToken,
      user: { email, name, picture }
    });

  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error logging in with Google',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Generate new Tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    user.isVerify = false;

    // Save new hashedRefreshToken and tokenVersion
    await user.save();

    if (user.role === "buyer" && req.query.isWebAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied for buyers on Web Admin.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful. Please verify OTP.',
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message || error,
    });
  }
};

exports.checkMail = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Generate new Tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // Save new hashedRefreshToken and tokenVersion
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'please verify OTP.',
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Error during verify:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message || error,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const token = req.header('Authorization')?.split(' ')[1]; // Get encrypted access token

  if (!token) {
    return res.status(401).json({ success: false, message: 'No access token provided' });
  }

  try {
    // Decrypt and verify token
    const decryptedToken = decrypt(token);
    const decoded = jwt.verify(decryptedToken, JWT_SECRET);


    const userId = decoded.id;
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Token expired. Please re-login.'});
    }

    // Validate OTP
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (user.passwordResetOtp !== hashedOtp || user.passwordResetExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Generate new tokens
    // Clear OTP data & save new refresh token
    user.passwordResetOtp = null;
    user.passwordResetExpires = null;
    user.isVerify = true;
    user.status = "active"

    const { accessToken, refreshToken, hashedRefreshToken } = await generateTokens(user);
    user.hashedRefreshToken = hashedRefreshToken;

    await user.save();

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

exports.refreshToken = async (req, res) => {
  const { refreshToken: encryptedRefreshToken, email } = req.body;

  if (!encryptedRefreshToken || !email) {
    return res.status(401).json({ message: 'Email and refresh token are required' });
  }

  try {
    const rawRefreshToken = decrypt(encryptedRefreshToken);

    const user = await User.findOne({ where: { email } });

    if (!user || !user.hashedRefreshToken) {
      return res.status(403).json({ message: 'Invalid token or user not found' });
    }

    const isMatch = await bcrypt.compare(rawRefreshToken, user.hashedRefreshToken);

    if (!isMatch) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const newAccessToken = jwt.sign(
        { id: user.id, role: user.role, tokenVersion: user.tokenVersion },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    return res.json({
      accessToken: encrypt(newAccessToken)
    });

  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(500).json({ message: 'Token decryption or validation failed', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const token = req.header('Authorization')?.split(' ')[1]; // Get encrypted access token

  if (!token) {
    return res.status(401).json({ success: false, message: 'No access token provided' });
  }

  try {
    // Check if user exists
    const decryptedToken = decrypt(token);
    const decoded = jwt.verify(decryptedToken, JWT_SECRET);

    const userId = decoded.id;
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user data
    user.password = hashedPassword;
    user.passwordResetOtp = null;
    user.passwordResetExpires = null;
    user.hashedRefreshToken = null; // Invalidate refresh token

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please login again.',
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message,
    });
  }
};

exports.sendOtpForReset = async (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(decrypt(token), JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { accessToken, refreshToken, hashedRefreshToken } = await generateTokens(user);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;

    user.passwordResetOtp = hashedOtp;
    user.passwordResetExpires = Date.now() + otpExpiryMinutes * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Your OTP for Password Reset',
      html: `
        <h2>Password Reset Verification</h2>
        <p>Use this OTP to reset your password:</p>
        <h1>${otp}</h1>
        <p>This code will expire in ${otpExpiryMinutes} minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully to your email', accessToken, refreshToken  });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending OTP',
      error: error.message || error,
    });
  }
};

exports.logout = async (req, res) => {
  const encryptedToken = req.header('Authorization')?.split(' ')[1];

  if (!encryptedToken) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  try {
    const decryptedToken = decrypt(encryptedToken);
    let decoded;
    try {
      decoded = jwt.verify(decryptedToken, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const expiredDecoded = jwt.decode(decryptedToken);
        if (expiredDecoded) {
          await Blacklist.create({
            token: decryptedToken,
            expiresAt: new Date(expiredDecoded.exp * 1000),
          });
        }
      }

      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Optional: Check if already blacklisted
    const isBlacklisted = await Blacklist.findOne({ where: { token: decryptedToken } });
    if (isBlacklisted) {
      return res.status(409).json({ success: false, message: 'Token already blacklisted' });
    }

    await Blacklist.create({
      token: decryptedToken,
      expiresAt: new Date(decoded.exp * 1000),
    });

    res.status(200).json({ success: true, message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error: error.message,
    });
  }
};

