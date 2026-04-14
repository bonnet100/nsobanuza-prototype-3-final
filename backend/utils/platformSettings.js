const { pool } = require('../db');

const defaultAiProviderPreference = process.env.AI_PROVIDER_PREFERENCE || 'auto';

const defaultPlatformSettings = {
  chatbotEnabled: true,
  aiProviderPreference: defaultAiProviderPreference,
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:3b',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  xaiModel: process.env.XAI_MODEL || 'grok-3-mini',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-5-mini',
  huggingFaceModel: process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
  supportedLanguages: ['en', 'fr', 'rw', 'sw']
};

const storedKeys = {
  chatbotEnabled: {
    key: 'chatbot_enabled',
    parse: (value) => value === 'true',
    serialize: (value) => String(Boolean(value))
  },
  aiProviderPreference: {
    key: 'ai_provider_preference',
    parse: (value) => value || defaultPlatformSettings.aiProviderPreference,
    serialize: (value) => String(value)
  },
  ollamaModel: {
    key: 'ollama_model',
    parse: (value) => value || defaultPlatformSettings.ollamaModel,
    serialize: (value) => String(value)
  },
  geminiModel: {
    key: 'gemini_model',
    parse: (value) => value || defaultPlatformSettings.geminiModel,
    serialize: (value) => String(value)
  },
  xaiModel: {
    key: 'xai_model',
    parse: (value) => value || defaultPlatformSettings.xaiModel,
    serialize: (value) => String(value)
  },
  openaiModel: {
    key: 'openai_model',
    parse: (value) => value || defaultPlatformSettings.openaiModel,
    serialize: (value) => String(value)
  },
  huggingFaceModel: {
    key: 'huggingface_model',
    parse: (value) => value || defaultPlatformSettings.huggingFaceModel,
    serialize: (value) => String(value)
  }
};

function normalizeProviderPreference(value) {
  return ['auto', 'ollama', 'gemini', 'huggingface', 'xai', 'openai', 'builtin'].includes(value)
    ? value
    : defaultPlatformSettings.aiProviderPreference;
}

async function fetchOllamaModels() {
  try {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    const response = await fetch(`${baseUrl}/api/tags`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data.models)
      ? data.models
          .map((model) => model?.name)
          .filter(Boolean)
      : [];
  } catch (_error) {
    return [];
  }
}

async function getPlatformSettings() {
  const result = await pool.query(
    `SELECT key, value
     FROM platform_settings
     WHERE key = ANY($1::text[])`,
    [Object.values(storedKeys).map((item) => item.key)]
  );

  const values = Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
  const ollamaAvailableModels = await fetchOllamaModels();

  const settings = {
    chatbotEnabled: values[storedKeys.chatbotEnabled.key]
      ? storedKeys.chatbotEnabled.parse(values[storedKeys.chatbotEnabled.key])
      : defaultPlatformSettings.chatbotEnabled,
    aiProviderPreference: normalizeProviderPreference(
      storedKeys.aiProviderPreference.parse(values[storedKeys.aiProviderPreference.key])
    ),
    ollamaModel: storedKeys.ollamaModel.parse(values[storedKeys.ollamaModel.key]),
    geminiModel: storedKeys.geminiModel.parse(values[storedKeys.geminiModel.key]),
    xaiModel: storedKeys.xaiModel.parse(values[storedKeys.xaiModel.key]),
    openaiModel: storedKeys.openaiModel.parse(values[storedKeys.openaiModel.key]),
    huggingFaceModel: storedKeys.huggingFaceModel.parse(values[storedKeys.huggingFaceModel.key]),
    supportedLanguages: defaultPlatformSettings.supportedLanguages,
    ollamaAvailableModels,
    providers: {
      ollamaConfigured: ollamaAvailableModels.length > 0,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      xaiConfigured: Boolean(process.env.XAI_API_KEY),
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      huggingFaceConfigured: Boolean(process.env.HUGGINGFACE_API_KEY),
      builtInConfigured: true
    }
  };

  return settings;
}

async function updatePlatformSettings(payload = {}) {
  const updates = [];

  if (typeof payload.chatbotEnabled === 'boolean') {
    updates.push({
      key: storedKeys.chatbotEnabled.key,
      value: storedKeys.chatbotEnabled.serialize(payload.chatbotEnabled)
    });
  }

  if (typeof payload.aiProviderPreference === 'string') {
    updates.push({
      key: storedKeys.aiProviderPreference.key,
      value: storedKeys.aiProviderPreference.serialize(normalizeProviderPreference(payload.aiProviderPreference.trim().toLowerCase()))
    });
  }

  if (typeof payload.ollamaModel === 'string' && payload.ollamaModel.trim()) {
    updates.push({
      key: storedKeys.ollamaModel.key,
      value: storedKeys.ollamaModel.serialize(payload.ollamaModel.trim())
    });
  }

  if (typeof payload.geminiModel === 'string' && payload.geminiModel.trim()) {
    updates.push({
      key: storedKeys.geminiModel.key,
      value: storedKeys.geminiModel.serialize(payload.geminiModel.trim())
    });
  }

  if (typeof payload.xaiModel === 'string' && payload.xaiModel.trim()) {
    updates.push({
      key: storedKeys.xaiModel.key,
      value: storedKeys.xaiModel.serialize(payload.xaiModel.trim())
    });
  }

  if (typeof payload.openaiModel === 'string' && payload.openaiModel.trim()) {
    updates.push({
      key: storedKeys.openaiModel.key,
      value: storedKeys.openaiModel.serialize(payload.openaiModel.trim())
    });
  }

  if (typeof payload.huggingFaceModel === 'string' && payload.huggingFaceModel.trim()) {
    updates.push({
      key: storedKeys.huggingFaceModel.key,
      value: storedKeys.huggingFaceModel.serialize(payload.huggingFaceModel.trim())
    });
  }

  if (updates.length > 0) {
    for (const update of updates) {
      await pool.query(
        `INSERT INTO platform_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key)
         DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [update.key, update.value]
      );
    }
  }

  return getPlatformSettings();
}

module.exports = {
  defaultPlatformSettings,
  getPlatformSettings,
  updatePlatformSettings
};
