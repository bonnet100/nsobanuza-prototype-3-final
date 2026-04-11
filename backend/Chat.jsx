const express = require('express');
const router = express.Router();

// Mock AI logic for the health assistant prototype
router.post('/', async (req, res) => {
  const { message, language, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Fallback logic to generate answers when OpenAI fails (e.g., Error 429 Quota Exceeded)
  const getFallbackAnswer = (lang, msg) => {
    if (lang === 'rw') return `Urakoze ku kibazo cyawe: "${msg}". Ndi hano kugirango nkurinde kandi nkuhe amakuru ku buzima.`;
    if (lang === 'fr') return `Merci pour votre question: "${msg}". Je suis là pour vous aider avec vos questions de santé.`;
    return `Thank you for your question: "${msg}". I am your health assistant, how can I support you further?`;
  };

  try {
    // Your actual AI call (likely in chatHandler.js) is currently hitting a quota limit.
    // If you were calling handleChatRequest, you should wrap it in this try block.
    
    // For now, to keep your app running without errors, we use the fallback:
    const answer = getFallbackAnswer(language, message);
    res.json({ answer });
  } catch (error) {
    // If OpenAI returns a 429 or any other error, we catch it here and return a fallback response
    console.error('AI Service Error (using fallback):', error.message);
    const answer = getFallbackAnswer(language, message);
    // We still return a 200 OK so the frontend doesn't show a red error message
    res.json({ answer, warning: 'AI service currently at limit' });
  }
});

module.exports = router;