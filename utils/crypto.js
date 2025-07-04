const crypto = require('crypto');
const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

dotenv.config();

const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || 'default_key').digest(); // 256-bit key
const IV_LENGTH = 16; // AES block size

// Encrypt Data
const encrypt = (data) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

// Decrypt Data
const decrypt = (data) => {
  const [iv, encrypted] = data.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const generateTokens = async (user) => {
  const rawRefreshToken = crypto.randomBytes(64).toString('hex');
  const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, 10);

  // Ensure user.tokenVersion is a string and then increment it
  user.tokenVersion = (parseInt(user.tokenVersion) + 1).toString();
  user.hashedRefreshToken = hashedRefreshToken;
  await user.save();

  const accessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
        isVerified: user.isVerify
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
  );

  return {
    accessToken: encrypt(accessToken),
    refreshToken: encrypt(rawRefreshToken),
  };
};

module.exports = { encrypt, decrypt, generateTokens };
