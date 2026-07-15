const express = require('express');
const router = express.Router();
const { callGemini, getFriendlyGeminiError, SYSTEM_PROMPT } = require('../utils/gemini');
router.post('/chat', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/(^["']|["']$)/g, '');
    if (!apiKey) {
      return res.status(500).json({ reply: 'Gemini API key not configured. Set GEMINI_API_KEY in your .env file.' });
    }

    const reply = await callGemini([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message },
    ], apiKey);

    res.json({ reply: reply || 'AI service temporarily unavailable. Please try again or create a support ticket.' });
  } catch (error) {
    console.error('Gemini error:', error.message);
    res.json({ reply: `AI service error: ${getFriendlyGeminiError(error)}` });
  }
});

module.exports = router;
