const express = require('express');
const { askOpenAI, fallbackResponse } = require('../utils/openai');
const router = express.Router();

router.post('/', async (req, res) => {
  const message = String(req.body.message || '').trim();
  const language = String(req.body.language || 'en').trim().toLowerCase();
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const answer = await askOpenAI(message, language);
    res.json({ answer });
  } catch (error) {
    console.error('Chat API error:', error);
    res.json({ answer: fallbackResponse(message, language) });
  }
});

module.exports = router;
