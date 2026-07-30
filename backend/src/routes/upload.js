const express = require('express');
const multer = require('multer');
const { uploadBuffer } = require('../utils/cloudinary');
const { protect } = require('../middleware/auth');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ALLOWED = ['pdf','jpg','jpeg','png','gif','webp','svg','bmp','ico','tiff'];
    const ext = (file.originalname || '').split('.').pop()?.toLowerCase();
    if (ALLOWED.includes(ext)) return cb(null, true);
    cb(new Error(`File type .${ext} is not allowed`));
  },
});

router.post('/', protect, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large (max 50MB)' });
      if (err.message) return res.status(400).json({ error: err.message });
      return res.status(400).json({ error: 'Upload failed' });
    }

    try {
      if (!req.file) return res.status(400).json({ error: 'No file provided' });

      const { originalname, buffer, size } = req.file;
      console.log(`[upload] received name=${originalname} size=${size} mimetype=${req.file.mimetype}`);

      const result = await uploadBuffer(buffer, originalname);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error(`[upload] error: ${error.message}`);
      const msg = error?.http_code === 400
        ? 'Upload failed — invalid file data'
        : error?.http_code === 401
          ? 'Upload failed — Cloudinary authentication error'
          : error?.http_code === 403
            ? 'Upload failed — Cloudinary permission denied'
            : `Upload failed — ${error.message}`;
      res.status(400).json({ error: msg });
    }
  });
});

module.exports = router;
