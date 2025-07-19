// middleware/upload.js
const multer = require('multer');

const storage = multer.memoryStorage(); // Store file in memory as a buffer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // max file size: 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, or WEBP images are allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
