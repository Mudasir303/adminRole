const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg', '.ico', '.avif'];
  const ext = path.extname(file.originalname || '').toLowerCase();

  // Accept by MIME type OR by extension (covers less common image types)
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    // Provide an explicit error so the client can be informed
    cb(new Error('Invalid file type. Only image files are allowed.'), false);
  }
};

module.exports = multer({ storage, fileFilter });
