const fetch = global.fetch || require('node-fetch');

const systemPrompt = `You are Nsobo, a health education assistant for youth in Rwanda. Answer only sexual and reproductive health, mental health, contraception, HIV, relationships, and periods questions. Use a supportive tone. If unsure, respond: "I am not a doctor. Please consult a verified provider on Nsobanuza."`;

function fallbackResponse(message, language) {
  const lower = message.toLowerCase();
  const responseMap = [
    { tests: ['period', 'menstru', 'cycle', 'imyaka'], en: 'A cycle is usually 28 days. Track your period start date and symptoms for a better estimate.', rw: 'Igihe gisanzwe ni iminsi 28. Kanda itariki yawe y’imihango kugira ngo ubone uko bizagenda.', fr: 'Un cycle moyen est de 28 jours. Suivez la date de début de vos règles pour mieux estimer.' },
    { tests: ['contraception', 'pill', 'prevention', 'gufata', 'contracept'], en: 'Contraception choices depend on your body and goals. Speak with a verified provider to find the best method.', rw: 'Uburyo bwo kwirinda gusama bushingira ku mubiri wawe. Vugana n’umuhanga wemewe kugira ngo ubone icyakubereye.', fr: 'Le choix de contraception dépend de votre corps et de vos objectifs. Consultez un prestataire vérifié.' },
    { tests: ['hiv', 'virus', 'vih', 'sida'], en: 'HIV testing is important. If you think you were exposed, get tested by a verified provider as soon as possible.', rw: 'Kwipimisha VIH birakenewe. Niba wumva hari icyo wakemuye, jya kwipimisha uko bishoboka kose.', fr: 'Le dépistage du VIH est important. Si vous pensez avoir été exposé(e), faites-vous tester rapidement.' },
    { tests: ['stress', 'anxiety', 'depression', 'umutima', 'stress'], en: 'Mental health matters. Talk to someone you trust and contact a verified health provider if you feel overwhelmed.', rw: 'Ubuzima bwo mu mutwe ni ingenzi. Vugana n’umuntu wizewe kandi ushake umufasha wemewe niba wumva ubabaye.', fr: 'La santé mentale est importante. Parlez à une personne de confiance et contactez un prestataire vérifié si vous vous sentez dépassé(e).' }
  ];

  const match = responseMap.find((item) => item.tests.some((word) => lower.includes(word)));
  if (match) {
    return language === 'fr' ? match.fr : language === 'rw' ? match.rw : match.en;
  }

  const fallback = {
    en: 'I am not a doctor. Please consult a verified provider on Nsobanuza.',
    rw: 'Sindi umuganga. Nyamuneka vugana n’umuprofeseri wemewe kuri Nsobanuza.',
    fr: 'Je ne suis pas médecin. Veuillez consulter un prestataire vérifié sur Nsobanuza.'
  };

  return fallback[language] || fallback.en;
}

async function askOpenAI(message, language) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackResponse(message, language);
  }

  const prompt = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Answer in ${language === 'fr' ? 'French' : language === 'rw' ? 'Kinyarwanda' : 'English'}: ${message}` }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: prompt, max_tokens: 220, temperature: 0.7 })
  });

  const data = await response.json();
  if (!data.choices || !data.choices[0]) {
    return fallbackResponse(message, language);
  }

  return data.choices[0].message.content.trim();
}

module.exports = { askOpenAI, fallbackResponse };
