const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with sanitized filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// Initial MIME type filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: fileFilter
});

/**
 * Middleware: Verifies magic bytes/content signatures of uploaded file
 * Prevents attackers from uploading scripts disguised with an image extension.
 */
function verifyImageSignature(req, res, next) {
  if (!req.file) return next();

  const filePath = req.file.path;
  fs.open(filePath, 'r', (err, fd) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'Unable to verify uploaded file.' });
    }

    const buffer = Buffer.alloc(12);
    fs.read(fd, buffer, 0, 12, 0, (readErr) => {
      fs.close(fd, () => {});

      if (readErr) {
        fs.unlink(filePath, () => {});
        return res.status(400).json({ success: false, message: 'File read error during security verification.' });
      }

      // Check signatures
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isWebp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';

      if (!isJpeg && !isPng && !isWebp) {
        // Discard malicious file
        fs.unlink(filePath, () => {});
        return res.status(400).json({
          success: false,
          message: 'Security validation failed: File content does not match genuine image signatures.'
        });
      }

      next();
    });
  });
}

module.exports = {
  upload,
  verifyImageSignature
};
