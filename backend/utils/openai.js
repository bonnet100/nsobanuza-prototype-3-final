const OpenAI = require('openai');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const OLLAMA_API_BASE = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

const systemPrompt = `You are Nsobo, the Nsobanuza health education assistant for youth in Rwanda.
Stay supportive, practical, stigma-free, and culturally respectful.
You can help with sexual and reproductive health, mental health, relationships, consent, contraception, HIV prevention, menstrual health, and how to use Nsobanuza features.
You can also help users present Nsobanuza as a confidential youth-focused digital health platform for Rwanda.
You can reply in Kinyarwanda, English, French, and Swahili.
Do not claim to diagnose, prescribe, or replace emergency care.
If a user seems in immediate danger, strongly advise them to seek urgent in-person help from a trusted adult, local emergency service, or verified professional.
If unsure, say that you are not a doctor and suggest speaking with a verified provider on Nsobanuza.`;

function getLanguageName(language) {
  if (language === 'fr') return 'French';
  if (language === 'rw') return 'Kinyarwanda';
  if (language === 'sw') return 'Swahili';
  return 'English';
}

function getDisabledResponse(language) {
  const responses = {
    en: 'Nsobo is temporarily paused by the platform administrator. Please try again later or contact a verified provider on Nsobanuza.',
    rw: "Nsobo yahagaritswe by'agateganyo n'ubuyobozi bwa platform. Ongera ugerageze nyuma cyangwa uvugane n'umuhanga wemewe kuri Nsobanuza.",
    fr: "Nsobo est temporairement suspendu par l'administration de la plateforme. Reessayez plus tard ou contactez un prestataire verifie sur Nsobanuza.",
    sw: 'Nsobo imesimamishwa kwa muda na msimamizi wa jukwaa. Jaribu tena baadaye au wasiliana na mtaalamu aliyethibitishwa kwenye Nsobanuza.'
  };

  return responses[language] || responses.en;
}

function fallbackResponse(message, language) {
  const lower = message.toLowerCase();
  const pitchRequest =
    lower.includes('nsobanuza') ||
    lower.includes('present') ||
    lower.includes('pitch') ||
    lower.includes('project') ||
    lower.includes('platform') ||
    lower.includes('ecosystem');

  if (pitchRequest) {
    const presentation = {
      en: 'Nsobanuza is a confidential youth health platform for Rwanda that combines a trusted health feed, multilingual AI guidance, menstrual and wellness tracking, a library of health videos and guides, and a verified professional marketplace. It helps young people learn without stigma, track their wellbeing, and move from information to trusted care in a private, culturally respectful, low-data experience.',
      rw: "Nsobanuza ni urubuga rw'ibanga rwafasha urubyiruko rwo mu Rwanda kubona amakuru y'ubuzima yizewe, AI ivuga indimi nyinshi, gukurikirana imihango n'imibereho, library y'amashusho n'inyandiko z'ubuzima, hamwe n'abahanga bemejwe. Ifasha urubyiruko kwiga nta soni, gukurikirana ubuzima bwabo no kugera ku bufasha bwizewe mu buryo bworoshye kandi bwubahiriza umuco.",
      fr: "Nsobanuza est une plateforme confidentielle de sante pour les jeunes au Rwanda qui combine un fil de contenus fiables, une assistance IA multilingue, le suivi menstruel et du bien-etre, une bibliotheque de videos et guides, ainsi qu'un marche de professionnels verifies. Elle aide les jeunes a apprendre sans stigmatisation, a suivre leur sante et a passer de l'information a des soins fiables dans une experience privee et respectueuse du contexte local.",
      sw: 'Nsobanuza ni jukwaa la siri la afya ya vijana nchini Rwanda linalounganisha mtiririko wa taarifa za afya zinazoaminika, msaada wa AI wa lugha nyingi, ufuatiliaji wa hedhi na ustawi, maktaba ya video na miongozo ya afya, pamoja na soko la wataalamu waliothibitishwa. Linasaidia vijana kujifunza bila unyanyapaa, kufuatilia ustawi wao, na kutoka kwenye taarifa kwenda kwenye huduma salama katika uzoefu wa faragha unaoheshimu tamaduni.'
    };

    return presentation[language] || presentation.en;
  }

  const responseMap = [
    {
      tests: ['period', 'menstru', 'cycle', 'imyaka', 'hedhi', 'kipindi'],
      en: 'A cycle is often around 28 days, but many people normally range between about 21 and 35 days. Track your period start date and symptoms for a more personal estimate.',
      rw: "Igihe cy'imihango gikunze kuba hafi y'iminsi 28, ariko hari benshi bagira iminsi iri hagati ya 21 na 35. Andika itariki y'imihango n'ibimenyetso kugira ngo ubone ishusho irushijeho kukwereka ukuri.",
      fr: 'Un cycle dure souvent autour de 28 jours, mais il peut normalement varier entre 21 et 35 jours. Notez la date de debut des regles et vos symptomes pour une estimation plus personnelle.',
      sw: 'Mzunguko wa hedhi mara nyingi huwa karibu siku 28, lakini kwa kawaida unaweza kuwa kati ya siku 21 hadi 35. Rekodi tarehe ya kuanza hedhi na dalili zako ili kupata makadirio yanayokufaa zaidi.'
    },
    {
      tests: ['contraception', 'pill', 'prevention', 'gufata', 'contracept', 'uzazi wa mpango'],
      en: 'Contraception choices depend on your body, health history, and goals. A verified provider can help you compare methods and choose the safest option for you.',
      rw: "Uburyo bwo kwirinda gusama bushingira ku mubiri wawe, amateka y'ubuzima bwawe n'intego zawe. Umuhanga wemewe ashobora kugufasha kugereranya uburyo butandukanye no guhitamo ubukubereye.",
      fr: 'Le choix de contraception depend de votre corps, de vos antecedents de sante et de vos objectifs. Un prestataire verifie peut vous aider a comparer les methodes et a choisir la plus sure pour vous.',
      sw: 'Njia ya uzazi wa mpango hutegemea mwili wako, historia ya afya yako, na malengo yako. Mtaalamu aliyethibitishwa anaweza kukusaidia kulinganisha njia tofauti na kuchagua iliyo salama kwako.'
    },
    {
      tests: ['hiv', 'virus', 'vih', 'sida'],
      en: 'HIV testing is important. If you think you were exposed, get tested by a verified provider as soon as possible and ask about prevention or treatment options.',
      rw: "Kwipimisha VIH ni ingenzi. Niba wumva hari aho wayanduriye, jya kwipimisha vuba bishoboka ku muhanga wemewe kandi ubaze uko wayirinda cyangwa uko wayivura.",
      fr: 'Le depistage du VIH est important. Si vous pensez avoir ete expose(e), faites-vous tester rapidement par un prestataire verifie et demandez conseil sur la prevention ou le traitement.',
      sw: 'Kupima HIV ni muhimu. Ikiwa unahisi uliweza kuambukizwa, pima haraka iwezekanavyo kwa mtaalamu aliyethibitishwa na uliza kuhusu kinga au matibabu.'
    },
    {
      tests: ['stress', 'anxiety', 'depression', 'umutima', 'msongo', 'wasiwasi'],
      en: 'Mental health matters. Rest, hydration, sleep, and talking to someone you trust can help, and a verified provider is a good next step if the feeling is getting heavier.',
      rw: "Ubuzima bwo mu mutwe ni ingenzi. Kuruhuka, kunywa amazi, gusinzira no kuvugana n'umuntu wizewe birafasha, kandi umuhanga wemewe ni intambwe nziza ikurikira niba ikibazo gikomeza kuremera.",
      fr: 'La sante mentale est importante. Le repos, l hydratation, le sommeil et le fait de parler a une personne de confiance peuvent aider. Un prestataire verifie est une bonne suite si le poids emotionnel augmente.',
      sw: 'Afya ya akili ni muhimu. Kupumzika, kunywa maji, kulala vizuri, na kuzungumza na mtu unayemwamini kunaweza kusaidia. Ikiwa hali inakuwa nzito zaidi, mtaalamu aliyethibitishwa ni hatua nzuri inayofuata.'
    },
    {
      tests: ['relationship', 'consent', 'boyfriend', 'girlfriend', 'love', 'ridhaa', 'mahusiano'],
      en: 'Healthy relationships should feel respectful, safe, and honest. If you feel pressured, confused, or unsafe, pause and speak with someone you trust or a verified provider.',
      rw: "Umubano mwiza ugomba kuba urimo kubahana, umutekano no kuvugisha ukuri. Niba wumva uri gushyirwaho igitutu cyangwa utizeye umutekano, banza ufate umwanya uvugane n'umuntu wizewe cyangwa umuhanga wemewe.",
      fr: 'Une relation saine doit etre respectueuse, sure et honnete. Si vous vous sentez sous pression, confuse ou en danger, faites une pause et parlez a une personne de confiance ou a un prestataire verifie.',
      sw: 'Mahusiano yenye afya yanapaswa kuwa ya heshima, usalama, na ukweli. Ukihisi unawekewa shinikizo, umechanganyikiwa, au huna usalama, simama kwanza na uzungumze na mtu unayemwamini au mtaalamu aliyethibitishwa.'
    }
  ];

  const match = responseMap.find((item) => item.tests.some((word) => lower.includes(word)));
  if (match) {
    if (language === 'fr') return match.fr;
    if (language === 'rw') return match.rw;
    if (language === 'sw') return match.sw;
    return match.en;
  }

  const fallback = {
    en: 'I can help with youth health information, menstrual tracking guidance, mental wellness, relationships, and presenting Nsobanuza. If your question needs personal medical advice, please consult a verified provider on Nsobanuza.',
    rw: "Nshobora kugufasha ku makuru y'ubuzima bw'urubyiruko, gukurikirana imihango, ubuzima bwo mu mutwe, imibanire, no gusobanura Nsobanuza. Niba ikibazo cyawe gikeneye ubujyanama bwihariye bwa muganga, nyamuneka vugana n'umuhanga wemewe kuri Nsobanuza.",
    fr: "Je peux aider pour les informations de sante des jeunes, le suivi menstruel, le bien-etre mental, les relations et la presentation de Nsobanuza. Si votre question demande un avis medical personnel, veuillez consulter un prestataire verifie sur Nsobanuza.",
    sw: 'Naweza kusaidia kuhusu taarifa za afya ya vijana, mwongozo wa ufuatiliaji wa hedhi, ustawi wa akili, mahusiano, na namna ya kuwasilisha Nsobanuza. Ikiwa swali lako linahitaji ushauri binafsi wa kitabibu, tafadhali wasiliana na mtaalamu aliyethibitishwa kwenye Nsobanuza.'
  };

  return fallback[language] || fallback.en;
}

function normalizeHistoryForResponses(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item.text === 'string' && ['user', 'assistant'].includes(item.role))
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: [
        {
          type: 'input_text',
          text: item.text.trim()
        }
      ]
    }))
    .filter((item) => item.content[0].text);
}

function normalizeHistoryForChat(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item.text === 'string' && ['user', 'assistant'].includes(item.role))
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: item.text.trim()
    }))
    .filter((item) => item.content);
}

function normalizeHistoryForGemini(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item.text === 'string' && ['user', 'assistant'].includes(item.role))
    .slice(-6)
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [
        {
          text: item.text.trim()
        }
      ]
    }))
    .filter((item) => item.parts[0].text);
}

function normalizeHistoryForOllama(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item.text === 'string' && ['user', 'assistant'].includes(item.role))
    .slice(-6)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: item.text.trim()
    }))
    .filter((item) => item.content);
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getHuggingFaceClient() {
  if (!process.env.HUGGINGFACE_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    baseURL: 'https://router.huggingface.co/v1'
  });
}

function createProviderError(message, status, body) {
  const error = new Error(message);
  error.status = status;
  error.body = body;
  return error;
}

function getOllamaAvailableModels(platformSettings = {}) {
  if (!Array.isArray(platformSettings.ollamaAvailableModels)) {
    return [];
  }

  return platformSettings.ollamaAvailableModels.filter((model) => typeof model === 'string' && model.trim());
}

function getOllamaModel(platformSettings) {
  const requestedModel = platformSettings.ollamaModel || process.env.OLLAMA_MODEL || 'qwen2.5:3b';
  const availableModels = getOllamaAvailableModels(platformSettings);

  if (availableModels.includes(requestedModel)) {
    return requestedModel;
  }

  return availableModels[0] || requestedModel;
}

function getMissingProviderReason(provider) {
  if (provider === 'ollama') {
    return 'ollama_not_configured';
  }

  if (provider === 'gemini') {
    return 'gemini_not_configured';
  }

  if (provider === 'huggingface') {
    return 'huggingface_not_configured';
  }

  if (provider === 'openai') {
    return 'openai_not_configured';
  }

  return 'provider_not_configured';
}

function mapProviderError(error) {
  if (error?.code === 'insufficient_quota' || error?.status === 429) {
    return 'insufficient_quota';
  }

  if (
    error instanceof OpenAI.AuthenticationError ||
    error?.status === 401 ||
    error?.status === 403
  ) {
    return 'invalid_api_key';
  }

  if (
    error instanceof OpenAI.APIConnectionError ||
    error?.code === 'ENOTFOUND' ||
    error?.cause?.code === 'ENOTFOUND' ||
    error?.name === 'TypeError'
  ) {
    return 'connection_error';
  }

  return 'service_unavailable';
}

function buildGeminiRequestBody(message, language, history) {
  return {
    system_instruction: {
      parts: [
        {
          text: `${systemPrompt}\nAlways answer in ${getLanguageName(language)} with clear, youth-friendly wording.`
        }
      ]
    },
    contents: [
      ...normalizeHistoryForGemini(history),
      {
        role: 'user',
        parts: [
          {
            text: message
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 700
    }
  };
}

async function sendGeminiRequest(message, language, history, model, stream = false) {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (typeof fetch !== 'function') {
    throw createProviderError('Global fetch is not available in this Node.js runtime.', 500, null);
  }

  const endpoint = stream ? 'streamGenerateContent?alt=sse' : 'generateContent';
  const response = await fetch(
    `${GEMINI_API_BASE}/${model}:${endpoint}`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildGeminiRequestBody(message, language, history))
    }
  );

  if (!response.ok) {
    throw createProviderError(
      `Gemini request failed with status ${response.status}.`,
      response.status,
      await response.text()
    );
  }

  return response;
}

function extractTextFromGeminiPayload(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map((part) => (typeof part.text === 'string' ? part.text : ''))
    .join('');
}

async function askWithGemini(message, language, history, model) {
  const response = await sendGeminiRequest(message, language, history, model, false);
  if (!response) {
    return null;
  }

  const payload = await response.json();
  const answer = extractTextFromGeminiPayload(payload).trim();
  if (!answer) {
    throw new Error('Gemini returned an empty response.');
  }

  return {
    answer,
    provider: 'gemini',
    configured: true,
    model,
    reason: null
  };
}

async function sendOllamaRequest(message, language, history, model, stream = false) {
  if (typeof fetch !== 'function') {
    throw createProviderError('Global fetch is not available in this Node.js runtime.', 500, null);
  }

  const response = await fetch(`${OLLAMA_API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      stream,
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\nAlways answer in ${getLanguageName(language)} with clear, youth-friendly wording.`
        },
        ...normalizeHistoryForOllama(history),
        {
          role: 'user',
          content: message
        }
      ]
    })
  });

  if (!response.ok) {
    throw createProviderError(
      `Ollama request failed with status ${response.status}.`,
      response.status,
      await response.text()
    );
  }

  return response;
}

async function askWithOllama(message, language, history, model) {
  const response = await sendOllamaRequest(message, language, history, model, false);
  const payload = await response.json();
  const answer = payload?.message?.content?.trim();

  if (!answer) {
    throw new Error('Ollama returned an empty response.');
  }

  return {
    answer,
    provider: 'ollama',
    configured: true,
    model,
    reason: null
  };
}

async function streamWithOllama(message, language, history, model, onDelta) {
  const response = await sendOllamaRequest(message, language, history, model, true);

  if (!response.body) {
    throw new Error('Ollama streaming response body is unavailable.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const payload = JSON.parse(line);
      const delta = payload?.message?.content || '';
      if (delta) {
        onDelta(delta);
      }
    }

    if (done) {
      break;
    }
  }

  return true;
}

async function streamWithGemini(message, language, history, model, onDelta) {
  const response = await sendGeminiRequest(message, language, history, model, true);
  if (!response) {
    return false;
  }

  if (!response.body) {
    throw new Error('Gemini streaming response body is unavailable.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || '';

    for (const event of events) {
      const data = event
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n');

      if (!data || data === '[DONE]') {
        continue;
      }

      const payload = JSON.parse(data);
      const delta = extractTextFromGeminiPayload(payload);
      if (delta) {
        onDelta(delta);
      }
    }

    if (done) {
      break;
    }
  }

  return true;
}

async function askWithOpenAI(message, language, history, model) {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

  const response = await client.responses.create({
    model,
    reasoning: { effort: 'low' },
    instructions: systemPrompt,
    input: [
      ...normalizeHistoryForResponses(history),
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Answer in ${getLanguageName(language)} with clear, youth-friendly language: ${message}`
          }
        ]
      }
    ]
  });

  const answer = response.output_text?.trim();
  if (!answer) {
    throw new Error('OpenAI returned an empty response.');
  }

  return {
    answer,
    provider: 'openai',
    configured: true,
    model,
    reason: null
  };
}

async function askWithHuggingFace(message, language, history, model) {
  const client = getHuggingFaceClient();
  if (!client) {
    return null;
  }

  const response = await client.chat.completions.create({
    model,
    temperature: 0.4,
    max_tokens: 500,
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}\nAlways answer in ${getLanguageName(language)} with clear, youth-friendly wording.`
      },
      ...normalizeHistoryForChat(history),
      {
        role: 'user',
        content: message
      }
    ]
  });

  const answer = response.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error('Hugging Face returned an empty response.');
  }

  return {
    answer,
    provider: 'huggingface',
    configured: true,
    model,
    reason: null
  };
}

function getProviderOrder(aiProviderPreference) {
  if (aiProviderPreference === 'ollama') {
    return ['ollama', 'gemini', 'huggingface', 'openai', 'builtin'];
  }

  if (aiProviderPreference === 'gemini') {
    return ['gemini', 'ollama', 'huggingface', 'openai', 'builtin'];
  }

  if (aiProviderPreference === 'huggingface') {
    return ['huggingface', 'ollama', 'gemini', 'openai', 'builtin'];
  }

  if (aiProviderPreference === 'openai') {
    return ['openai', 'ollama', 'gemini', 'huggingface', 'builtin'];
  }

  if (aiProviderPreference === 'builtin') {
    return ['builtin'];
  }

  return ['ollama', 'gemini', 'huggingface', 'openai', 'builtin'];
}

function getProviderModels(platformSettings) {
  return {
    ollama: getOllamaModel(platformSettings),
    gemini: platformSettings.geminiModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    huggingface: platformSettings.huggingFaceModel || process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
    openai: platformSettings.openaiModel || process.env.OPENAI_MODEL || 'gpt-5-mini'
  };
}

function getConfiguredProviders(platformSettings = {}, models = {}) {
  const ollamaAvailableModels = getOllamaAvailableModels(platformSettings);

  return {
    ollama: ollamaAvailableModels.includes(models.ollama || getOllamaModel(platformSettings)),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    huggingface: Boolean(process.env.HUGGINGFACE_API_KEY)
  };
}

async function askOpenAI(message, language, history = [], platformSettings = {}) {
  if (platformSettings.chatbotEnabled === false) {
    return {
      answer: getDisabledResponse(language),
      provider: 'fallback',
      configured: true,
      model: null,
      reason: 'chatbot_disabled'
    };
  }

  const providerOrder = getProviderOrder(platformSettings.aiProviderPreference || 'auto');
  const models = getProviderModels(platformSettings);
  const configured = getConfiguredProviders(platformSettings, models);
  let latestReason = null;

  for (const provider of providerOrder) {
    if (provider === 'builtin') {
      return {
        answer: fallbackResponse(message, language),
        provider: 'fallback',
        configured: configured.ollama || configured.gemini || configured.huggingface || configured.openai,
        model: models.ollama || models.gemini || models.huggingface || models.openai || null,
        reason: latestReason || 'builtin_fallback'
      };
    }

    if (!configured[provider]) {
      latestReason = getMissingProviderReason(provider);
      continue;
    }

    try {
      if (provider === 'ollama') {
        return await askWithOllama(message, language, history, models.ollama);
      }

      if (provider === 'gemini') {
        return await askWithGemini(message, language, history, models.gemini);
      }

      if (provider === 'huggingface') {
        return await askWithHuggingFace(message, language, history, models.huggingface);
      }

      if (provider === 'openai') {
        return await askWithOpenAI(message, language, history, models.openai);
      }
    } catch (error) {
      console.error(`${provider} request failed:`, error);
      latestReason = mapProviderError(error);
    }
  }

  return {
    answer: fallbackResponse(message, language),
    provider: 'fallback',
    configured: configured.ollama || configured.gemini || configured.huggingface || configured.openai,
    model: models.ollama || models.gemini || models.huggingface || models.openai || null,
    reason: latestReason || 'provider_not_configured'
  };
}

async function streamAssistantResponse(message, language, history = [], platformSettings = {}, handlers = {}) {
  const onMeta = handlers.onMeta || (() => {});
  const onDelta = handlers.onDelta || (() => {});

  if (platformSettings.chatbotEnabled === false) {
    onMeta({ provider: 'fallback', configured: true, model: null, reason: 'chatbot_disabled' });
    onDelta(getDisabledResponse(language));
    return;
  }

  const providerOrder = getProviderOrder(platformSettings.aiProviderPreference || 'auto');
  const models = getProviderModels(platformSettings);
  const configured = getConfiguredProviders(platformSettings, models);
  let latestReason = null;

  for (const provider of providerOrder) {
    if (provider === 'builtin') {
      onMeta({
        provider: 'fallback',
        configured: configured.ollama || configured.gemini || configured.huggingface || configured.openai,
        model: models.ollama || models.gemini || models.huggingface || models.openai || null,
        reason: latestReason || 'builtin_fallback'
      });
      onDelta(fallbackResponse(message, language));
      return;
    }

    if (!configured[provider]) {
      latestReason = getMissingProviderReason(provider);
      continue;
    }

    try {
      if (provider === 'ollama') {
        onMeta({ provider: 'ollama', configured: true, model: models.ollama, reason: null });
        await streamWithOllama(message, language, history, models.ollama, onDelta);
        return;
      }

      if (provider === 'gemini') {
        onMeta({ provider: 'gemini', configured: true, model: models.gemini, reason: null });
        await streamWithGemini(message, language, history, models.gemini, onDelta);
        return;
      }

      if (provider === 'huggingface') {
        const result = await askWithHuggingFace(message, language, history, models.huggingface);
        onMeta(result);
        onDelta(result.answer);
        return;
      }

      if (provider === 'openai') {
        const result = await askWithOpenAI(message, language, history, models.openai);
        onMeta(result);
        onDelta(result.answer);
        return;
      }
    } catch (error) {
      console.error(`${provider} streaming request failed:`, error);
      latestReason = mapProviderError(error);
    }
  }

  onMeta({
    provider: 'fallback',
    configured: configured.ollama || configured.gemini || configured.huggingface || configured.openai,
    model: models.ollama || models.gemini || models.huggingface || models.openai || null,
    reason: latestReason || 'provider_not_configured'
  });
  onDelta(fallbackResponse(message, language));
}

module.exports = {
  askOpenAI,
  fallbackResponse,
  getDisabledResponse,
  streamAssistantResponse
};
