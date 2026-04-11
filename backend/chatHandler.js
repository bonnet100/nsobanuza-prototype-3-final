const { askOpenAI, streamAssistantResponse } = require('./utils/openai');
const { getPlatformSettings } = require('./utils/platformSettings');

const handleChatRequest = async (req, res) => {
  try {
    const { message, language = 'en', history = [] } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const platformSettings = await getPlatformSettings();
    const result = await askOpenAI(String(message).trim(), language, history, platformSettings);

    return res.json({
      answer: result.answer,
      provider: result.provider,
      configured: result.configured,
      model: result.model,
      reason: result.reason || null
    });
  } catch (error) {
    console.error('Detailed AI Error:', error);

    return res.status(500).json({ error: 'AI assistant is currently unavailable.' });
  }
};

const handleChatStreamRequest = async (req, res) => {
  try {
    const { message, language = 'en', history = [] } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const platformSettings = await getPlatformSettings();

    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    const send = (payload) => {
      res.write(`${JSON.stringify(payload)}\n`);
    };

    await streamAssistantResponse(String(message).trim(), language, history, platformSettings, {
      onMeta: (meta) => send({ type: 'meta', ...meta }),
      onDelta: (text) => send({ type: 'delta', text })
    });

    send({ type: 'done' });
    return res.end();
  } catch (error) {
    console.error('Detailed AI Stream Error:', error);

    if (!res.headersSent) {
      return res.status(500).json({ error: 'AI assistant is currently unavailable.' });
    }

    res.write(`${JSON.stringify({ type: 'error', message: 'AI assistant is currently unavailable.' })}\n`);
    res.write(`${JSON.stringify({ type: 'done' })}\n`);
    return res.end();
  }
};

module.exports = { handleChatRequest, handleChatStreamRequest };
