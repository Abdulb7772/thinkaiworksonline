const express = require('express');
const { uploadBase64 } = require('../utils/cloudinary');
const { protect } = require('../middleware/auth');
const router = express.Router();

const MAX_SIZE = 50 * 1024 * 1024;
const ALLOWED_EXTS = [
  'jpg','jpeg','png','gif','webp','svg',
  'pdf',
  'doc','docx',
  'ppt','pptx',
  'xls','xlsx',
  'txt','csv',
  'zip',
  'mp4','mp3',
];

router.post('/', protect, async (req, res, next) => {
  try {
    const { file, name } = req.body;
    if (!file || !name) return res.status(400).json({ error: 'file and name required' });

    const ext = name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      return res.status(400).json({ error: `File type .${ext} is not allowed` });
    }

    const size = Math.round((file.length * 3) / 4);
    if (size > MAX_SIZE) {
      return res.status(400).json({ error: `File too large (max ${MAX_SIZE / 1024 / 1024}MB)` });
    }

    const { url, public_id, resource_type, format, bytes, original_filename } = await uploadBase64(file, name);
    res.json({
      success: true,
      url,
      public_id,
      name,
      resource_type,
      format,
      bytes,
      original_filename: original_filename || name,
    });
  } catch (error) {
    // ponytail: catch Cloudinary errors (invalid base64, quota, etc.) and surface a clean message
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

module.exports = router;
