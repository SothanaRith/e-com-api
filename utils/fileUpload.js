const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Allowed file extensions
const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mp3", ".wav"];

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type!"), false);
    }
};

// Set upload limits and configurations
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file limit
});

module.exports = upload;
