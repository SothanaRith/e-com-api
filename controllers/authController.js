const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { encrypt, decrypt } = require('../utils/crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Blacklist = require('../models/Blacklist');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Function to prune expired tokens in the blacklist
const pruneExpiredTokens = async () => {
  try {
    await Blacklist.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });
  } catch (error) {
    console.error('Error pruning expired tokens:', error);
  }
};

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
    // Step 1: Check if the email is already registered
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already registered.',
      });
    }

    // Step 2: Hash the password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Step 3: Create the new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    // Step 4: Generate access token for OTP verification
    const accessToken = jwt.sign(
      { id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '15m' } // Token expires in 15 minutes
    );

    // Step 5: Return the access token only
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify OTP.',
      accessToken,
    });
  } catch (error) {
    console.error('Error during registration:', error);

    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message || error,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Find the user by email
    const user = await User.findOne({ where: { email } });

    // If the user doesn't exist, return an invalid credentials message
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Step 2: Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Step 3: Generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token to the user's record
    user.refreshToken = refreshToken;
    await user.save();

    // Step 4: Return the success response with tokens
    res.status(200).json({
      success: true,
      message: 'please check your email for the OTP',
      accessToken
    });

  } catch (error) {
    console.error('Error during login:', error);  // Log error to console for debugging
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message || error,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const token = req.header('Authorization')?.split(' ')[1]; // Get access token

  if (!token) {
    return res.status(401).json({ success: false, message: 'No access token provided' });
  }

  try {
    // Verify the access token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Find the user by ID
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate OTP
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    if (user.passwordResetOtp !== hashedOtp || user.passwordResetExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Generate new JWT access and refresh tokens
    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Update user with new refresh token and clear OTP data
    user.refreshToken = refreshToken;
    user.passwordResetOtp = null;
    user.passwordResetExpires = null;
    await user.save();

    // Return success response with new tokens
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Step 1: Check if the user exists in the database
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Step 2: Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Using bcrypt to hash password

    // Step 3: Update the user's password and clear OTP data
    user.password = hashedPassword;
    user.passwordResetOtp = null;
    user.passwordResetExpires = null; // Clear OTP and expiration
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
  }
};

exports.sendOtpForReset = async (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get access token
  if (!token) {
    return res.status(401).json({ success: false, message: 'No access token provided' });
  }

  try {

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Find the user by ID
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.passwordResetOtp = hashedOtp;
    user.passwordResetExpires = Date.now() + 300000; // 5 minutes
    await user.save();
    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      html: `
          <div style="font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 30px; border-radius: 20px; background: linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(240, 240, 240, 0.8)), url('https://image.freshnewsasia.com/2021/id-155/fn-2021-11-25-07-19-35-1.jpg') no-repeat center center; background-size: cover; box-shadow: 15px 15px 30px #bebebe, -15px -15px 30px #ffffff;">
              <div style="display: flex; flex-wrap: wrap; justify-content: start; align-items: center;">
                <img src="https://i.postimg.cc/5tN9nCTt/Screenshot-2024-07-23-at-8-55-04-in-the-morning.png" alt="App Logo" style="height: 80px; border-radius: 10px; margin-right: 20px;">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP3HS2VsUkQGmtjNAk3MkkE544iFj1T9eMfQ&s" alt="Partner Logo" style="height: 80px; border-radius: 10px;">
              </div>
              <h2 style="color: #F97316; text-align: center; text-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1); font-family: 'Poppins', serif; margin: 20px 0;">Password Reset Request</h2>
              <p style="font-size: 18px; text-align: center; margin-bottom: 25px;">You requested a password reset. Please use the following code to reset your password:</p>
              <div style="padding: 30px; background: linear-gradient(145deg, rgba(240, 240, 240, 0.9), rgba(250, 250, 250, 0.9)); border-radius: 20px; text-align: center; margin: 25px 0; box-shadow: inset 5px 5px 15px rgba(0, 0, 0, 0.1), 5px 5px 15px rgba(0, 0, 0, 0.05);">
                <p style="font-size: 30px; font-weight: bold; color: #F97316; margin: 0; text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);">${otp}</p>
              </div>
              <p style="font-size: 18px; text-align: center; margin-bottom: 25px;">This code will expire in 5 minutes. If you did not request this, please ignore this email or contact support.</p>
              <hr style="border: none; border-top: 2px solid #ddd; margin: 25px 0;">
              <h3 style="color: #F97316; text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">Contact Information:</h3>
              <div style="padding: 20px; background: linear-gradient(145deg, rgba(249, 249, 249, 0.9), rgba(234, 234, 234, 0.9)); border-radius: 20px; box-shadow: inset 3px 3px 10px rgba(0, 0, 0, 0.05), 3px 3px 10px rgba(0, 0, 0, 0.05);">
                <p style="margin: 0 0 15px 0;"><strong>Name:</strong> Narith</p>
                <p style="margin: 0 0 15px 0;"><strong>Occupation:</strong> Software Developer</p>
                <p style="margin: 0 0 15px 0;"><strong>Phone:</strong> +855 786 352 73</p>
                <p style="margin: 0;"><strong>Telegram:</strong> <a href="https://t.me/NarithR" style="color: #1a73e8; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);">NarithR</a></p><br>
                <p style="font-size: 14px; color: #888; margin: 0;"> Supported by Aditi Academy.</p>
              </div>
              <footer style="margin-top: 30px; text-align: center;">
                <p style="font-size: 16px; color: #888; margin: 0;">&copy; 2024 Lkhon. All rights reserved.</p>
              </footer>
            </div>
            
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
      `,
    });

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error details:', error);  // Log detailed error information
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message || error,
    });
  }
};

exports.logout = async (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); 
    const expiryDate = new Date(decoded.exp * 1000); // Expiry date from decoded token

    await Blacklist.create({ token, expiresAt: expiryDate }); // Save token in blacklist table

    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid token', error: error.message });
  }
};

