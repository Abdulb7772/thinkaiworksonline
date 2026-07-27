const express = require('express');
const { uploadBase64 } = require('../utils/cloudinary');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    // ponytail: all auth users can upload; per-user quotas if spam becomes an issue
    const { file, name } = req.body;
    if (!file || !name) return res.status(400).json({ error: 'file and name required' });
    const result = await uploadBase64(file, name);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
