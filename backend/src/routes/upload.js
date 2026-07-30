const express = require('express');
const multer = require('multer');
const { uploadBuffer } = require('../utils/cloudinary');
const { protect } = require('../middleware/auth');
const router = express.Router();

const ALLOWED_MIMES = ['image/jpeg','image/png','image/webp','image/gif','application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only images and PDF files are allowed.'));
  },
});

router.post('/', protect, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File too large (max 50MB)' });
      return res.status(400).json({ success: false, message: 'Only images and PDF files are allowed.' });
    }

    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

      const { originalname, buffer, mimetype } = req.file;
      console.log(`[upload] received name=${originalname} mimetype=${mimetype} size=${buffer.length}`);

      const result = await uploadBuffer(buffer, originalname);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error(`[upload] error: ${error.message}`);
      res.status(400).json({ success: false, message: `Upload failed — ${error.message}` });
    }
  });
});

module.exports = router;
