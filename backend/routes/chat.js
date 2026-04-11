const express = require('express');
const { askOpenAI, fallbackResponse } = require('../utils/openai');
const router = express.Router();

router.post('/', async (req, res) => {
  const message = String(req.body.message || '').trim();
  const language = String(req.body.language || 'en').trim().toLowerCase();
  const history = Array.isArray(req.body.history) ? req.body.history : [];
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const result = await askOpenAI(message, language, history);
    res.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    res.json({
      answer: fallbackResponse(message, language),
      provider: 'fallback',
      configured: Boolean(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_MODEL || 'gpt-5-mini'
    });
  }
});

module.exports = router;
