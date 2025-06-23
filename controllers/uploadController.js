const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Chat } = require('../models');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', // Image
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm',
    '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.amr']; // Voice/Audio

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
  const fileFilter = (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExt)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only images, videos, and audio files are allowed!'), false); // Reject the file
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // Set a limit (e.g., 100MB)
  });

// Upload file and return its URL
exports.uploadFile = (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
  
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      let fileUrl = '';

      if(process.env.NODE_ENV !== 'production') {
        fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      } else {
        fileUrl = req.file.location;
      }
      res.status(200).json({ success: true, fileUrl });
    });
  };
  exports.deleteFile = async (req, res) => {
    const { filename } = req.params; // Assume the filename is passed in the URL
  
    // Construct the full file path
    const filePath = path.join(__dirname, '..', 'uploads', filename);
  
    try {
      // Check if the file exists in the file system
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }
  
      // Delete the file from the file system
      fs.unlinkSync(filePath);
  
      // Optionally, delete the file reference from the database (e.g., Chat model)
      // If the file is part of a chat message, you can delete the chat record or just remove the file URL
      await Chat.update(
        { message: '' },  // Clear the message if it contains the file URL
        { where: { message: { [Op.like]: `%${filename}%` } } } // Match the filename in the message
      );
  
      // Send a success response
      res.status(200).json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ success: false, message: 'Error deleting file', error: error.message });
    }
  };