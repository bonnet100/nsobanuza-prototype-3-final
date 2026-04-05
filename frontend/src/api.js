const STORAGE_KEYS = {
  adsRemovedUntil: 'nsobanuza_ads_removed_until',
  sponsoredBoost: 'nsobanuza_boost_sponsored',
  trackingEntries: 'nsobanuza_tracking_entries',
  chatHistory: 'nsobanuza_chat_history'
};

const image = (query, sig) =>
  `https://source.unsplash.com/featured/900x700/?${encodeURIComponent(query)}&sig=${sig}`;

const avatar = (query, sig) =>
  `https://source.unsplash.com/featured/300x300/?${encodeURIComponent(query)}&sig=${sig}`;

const delay = (value, ms = 180) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });

export const videos = [
  {
    id: 'rbc-hiv-self-test',
    youtubeId: 'BVx3OSGObek',
    category: 'sexualHealth',
    source: 'Rwanda Biomedical Center',
    thumbnail: image('Rwanda youth HIV self test kit', 1),
    title: {
      en: 'HIV self-testing is free and confidential',
      kin: 'Kwipima VIH ni ubuntu kandi bikorwa mu ibanga',
      fr: 'Le dépistage VIH à domicile est gratuit et confidentiel'
    },
    description: {
      en: 'A youth-friendly explainer on self-testing, privacy, and where to seek follow-up care in Rwanda.',
      kin: 'Ubusobanuro bworoshye ku rubyiruko ku buryo bwo kwipima, kubika ibanga, n’aho gushakira ubufasha bwisumbuye mu Rwanda.',
      fr: 'Une explication claire pour les jeunes sur l’autodépistage, la confidentialité et les lieux de prise en charge au Rwanda.'
    }
  },
  {
    id: 'moh-mental-support',
    youtubeId: '5YqVZDg9C70',
    category: 'mentalHealth',
    source: 'Ministry of Health',
    thumbnail: image('Rwanda youth counselling support line', 2),
    title: {
      en: 'Mental health support line 112',
      kin: 'Umurongo wa telefoni 112 w’ubufasha bwo mu mutwe',
      fr: 'Ligne d’assistance en santé mentale 112'
    },
    description: {
      en: 'A short guide on when to call 112, warning signs, and how to ask for support for yourself or a friend.',
      kin: 'Amabwiriza magufi y’igihe wahamagara 112, ibimenyetso byo kwitondera, n’uko wasabira ubufasha wowe cyangwa inshuti yawe.',
      fr: 'Un guide rapide pour savoir quand appeler le 112, quels signes observer et comment demander de l’aide pour soi ou un ami.'
    }
  },
  {
    id: 'rwamrec-consent',
    youtubeId: 'nQtF-TzTcCw',
    category: 'sexualHealth',
    source: 'RWAMREC',
    thumbnail: image('Rwanda couple healthy relationship conversation', 3),
    title: {
      en: 'Healthy relationships and consent',
      kin: 'Umubano mwiza n’icyemezo cyo kwemera',
      fr: 'Relations saines et consentement'
    },
    description: {
      en: 'An approachable conversation about respect, consent, and speaking up in relationships.',
      kin: 'Ikiganiro cyoroheje ku kubahana, kwemera, no kuvuga uko wiyumva mu mubano.',
      fr: 'Une conversation accessible sur le respect, le consentement et la prise de parole dans les relations.'
    }
  },
  {
    id: 'rmhi-periods',
    youtubeId: 'OB604Oeq4-k',
    category: 'periodHealth',
    source: 'Rwanda Menstrual Health Initiative',
    thumbnail: image('Rwanda girls menstrual health school', 4),
    title: {
      en: 'Periods are nothing to hide',
      kin: 'Imihango si ikintu cyo guhisha',
      fr: 'Les règles ne sont pas quelque chose à cacher'
    },
    description: {
      en: 'A stigma-reducing video about confidence, period products, and asking for support at school or home.',
      kin: 'Video igabanya ipfunwe ivuga ku kwigirira icyizere, ibikoresho by’isuku mu mihango, no gusaba ubufasha ku ishuri cyangwa mu rugo.',
      fr: 'Une vidéo pour réduire la stigmatisation autour de la confiance en soi, des produits menstruels et de la demande d’aide à l’école ou à la maison.'
    }
  },
  {
    id: 'pih-depression',
    youtubeId: 'te3V-loEABw',
    category: 'mentalHealth',
    source: 'Partners in Health',
    thumbnail: image('Rwanda clinic counselling depression support', 5),
    title: {
      en: 'Depression is treatable - here is how',
      kin: 'Agahinda gakabije karavurwa - dore uko bikorwa',
      fr: 'La dépression se soigne - voici comment'
    },
    description: {
      en: 'A compassionate introduction to symptoms of depression, treatment options, and reaching out early.',
      kin: 'Ubusobanuro bwuje impuhwe ku bimenyetso by’agahinda gakabije, uburyo bwo kuvurwa, no gushaka ubufasha hakiri kare.',
      fr: 'Une introduction bienveillante aux symptômes de la dépression, aux options de traitement et à l’importance de demander de l’aide tôt.'
    }
  },
  {
    id: 'rmhc-anxiety',
    youtubeId: 'fsUpurHkw4U',
    category: 'mentalHealth',
    source: 'Rwanda Mental Health Coalition',
    thumbnail: image('Rwanda young woman breathing exercise', 6),
    title: {
      en: 'Calming anxiety one step at a time',
      kin: 'Kugabanya guhangayika buhoro buhoro',
      fr: 'Apaiser l’anxiété pas à pas'
    },
    description: {
      en: 'Simple grounding exercises, breathing tips, and signs that you should speak to a professional.',
      kin: 'Imyitozo yoroshye yo kwisubiza mu buryo, uburyo bwo guhumeka neza, n’ibimenyetso byerekana ko ugomba kuvugana n’inzobere.',
      fr: 'Des exercices d’ancrage simples, des conseils de respiration et les signes indiquant qu’il faut consulter un professionnel.'
    }
  }
];

export const posts = [
  {
    id: 'post-rbc',
    organization: 'Rwanda Biomedical Center (RBC)',
    avatar: avatar('Rwandan young adult portrait health', 21),
    category: 'sexualHealth',
    isSponsored: false,
    mediaType: 'image',
    image: image('Rwanda youth test kit community health', 11),
    videoId: 'rbc-hiv-self-test',
    caption: {
      en: 'HIV self-testing is free and confidential. Pick up a kit, know your status, and reach out for support if you need it.',
      kin: 'Kwipima VIH ni ubuntu kandi bikorwa mu ibanga. Fata agapaki, umenye uko uhagaze, kandi usabe ubufasha niba ubukeneye.',
      fr: 'L’autodépistage du VIH est gratuit et confidentiel. Procurez-vous un kit, connaissez votre statut et demandez de l’aide si besoin.'
    }
  },
  {
    id: 'post-moh',
    organization: 'Ministry of Health (Rwanda)',
    avatar: avatar('Rwandan woman professional portrait', 22),
    category: 'mentalHealth',
    isSponsored: false,
    mediaType: 'video',
    image: image('Rwanda mental health helpline youth', 12),
    videoId: 'moh-mental-support',
    caption: {
      en: 'Mental health support line 112 is available when you feel overwhelmed, unsafe, or worried about a friend.',
      kin: 'Umurongo wa 112 utanga ubufasha bwo mu mutwe igihe wumva waremerewe, udatekanye, cyangwa uhangayikishijwe n’inshuti yawe.',
      fr: 'La ligne d’assistance 112 est disponible quand vous vous sentez dépassé, en danger, ou inquiet pour un ami.'
    }
  },
  {
    id: 'post-rwamrec',
    organization: 'RWAMREC',
    avatar: avatar('Rwandan man portrait workshop', 23),
    category: 'sexualHealth',
    isSponsored: true,
    mediaType: 'video',
    image: image('Rwanda healthy relationships workshop youth', 13),
    videoId: 'rwamrec-consent',
    caption: {
      en: 'Healthy relationships and consent start with respect, clear communication, and listening when someone says no.',
      kin: 'Umubano mwiza no kwemera bitangirana no kubahana, kuvugana neza, no kumva igihe umuntu yavuze oya.',
      fr: 'Les relations saines et le consentement commencent par le respect, une communication claire et l’écoute quand quelqu’un dit non.'
    }
  },
  {
    id: 'post-rmhi',
    organization: 'Rwanda Menstrual Health Initiative',
    avatar: avatar('Rwandan school girl portrait confidence', 24),
    category: 'periodHealth',
    isSponsored: false,
    mediaType: 'video',
    image: image('Rwanda school girls menstrual health confidence', 14),
    videoId: 'rmhi-periods',
    caption: {
      en: 'Periods are nothing to hide. Ask for pads, track your cycle, and speak openly with people you trust.',
      kin: 'Imihango si ikintu cyo guhisha. Saba pads, ukurikirane uruziga rwawe, kandi ubiganireho n’abo wizera.',
      fr: 'Les règles ne sont pas quelque chose à cacher. Demandez des protections, suivez votre cycle et parlez-en avec des personnes de confiance.'
    }
  },
  {
    id: 'post-pih',
    organization: 'Partners in Health',
    avatar: avatar('Rwandan clinician smiling portrait', 25),
    category: 'mentalHealth',
    isSponsored: false,
    mediaType: 'video',
    image: image('Rwanda clinic counselling depression support', 15),
    videoId: 'pih-depression',
    caption: {
      en: 'Depression is treatable - here is how. Support can include talking therapy, check-ins, sleep routines, and trusted care.',
      kin: 'Agahinda gakabije karavurwa - dore uko bikorwa. Ubufasha bushobora kuba ibiganiro n’inzobere, gukurikiranwa, gahunda nziza yo gusinzira, n’ubuvuzi bwizewe.',
      fr: 'La dépression se soigne - voici comment. L’aide peut inclure une thérapie, des suivis, des routines de sommeil et des soins de confiance.'
    }
  },
  {
    id: 'post-rmhc',
    organization: 'Rwanda Mental Health Coalition',
    avatar: avatar('Rwandan youth portrait calm smile', 26),
    category: 'mentalHealth',
    isSponsored: false,
    mediaType: 'image',
    image: image('Rwanda youth mindfulness breathing support', 16),
    videoId: 'rmhc-anxiety',
    caption: {
      en: 'Anxiety can feel loud in your body. Slow breathing, grounding, and talking to someone can help.',
      kin: 'Guhangayika bishobora kwigaragaza cyane mu mubiri. Guhumeka buhoro, kwisubiza mu buryo, no kuganira n’umuntu bishobora gufasha.',
      fr: 'L’anxiété peut être très forte dans le corps. Respirer lentement, se recentrer et parler à quelqu’un peut aider.'
    }
  }
];

export const providers = [
  {
    id: 'provider-1',
    name: 'Dr. Aline Mukamana',
    specialty: 'sexualHealth',
    rating: 4.9,
    fee: '15,000 RWF',
    photo: avatar('Rwandan female doctor portrait', 31)
  },
  {
    id: 'provider-2',
    name: 'Dr. Eric Habimana',
    specialty: 'mentalHealth',
    rating: 4.8,
    fee: '18,000 RWF',
    photo: avatar('Rwandan male psychologist portrait', 32)
  },
  {
    id: 'provider-3',
    name: 'Nurse Chantal Uwase',
    specialty: 'sexualHealth',
    rating: 4.7,
    fee: '10,000 RWF',
    photo: avatar('Rwandan nurse portrait clinic', 33)
  },
  {
    id: 'provider-4',
    name: 'Dr. Patrick Nshimiyimana',
    specialty: 'mentalHealth',
    rating: 4.9,
    fee: '20,000 RWF',
    photo: avatar('Rwandan therapist portrait professional', 34)
  },
  {
    id: 'provider-5',
    name: 'Midwife Diane Umuhoza',
    specialty: 'sexualHealth',
    rating: 4.8,
    fee: '12,000 RWF',
    photo: avatar('Rwandan midwife portrait warm', 35)
  }
];

const exampleQuestions = {
  en: [
    {
      question: 'How does HIV self-testing work?',
      answer: 'HIV self-testing uses a simple kit and gives a private first result. Follow the instructions carefully and visit a provider if the result is positive or unclear.'
    },
    {
      question: 'Can I use condoms with another contraceptive?',
      answer: 'Yes. Condoms can be used together with another contraceptive method for extra pregnancy protection and STI prevention.'
    },
    {
      question: 'What does consent mean in a relationship?',
      answer: 'Consent means every person freely agrees, understands what is happening, and can change their mind at any time.'
    },
    {
      question: 'What can I do when I feel anxious?',
      answer: 'Try slow breathing, step away from stress if you can, drink water, and talk to someone you trust if the feeling stays strong.'
    },
    {
      question: 'How often should I change a pad?',
      answer: 'Many people change a pad every 4 to 6 hours, or sooner if it feels full or uncomfortable.'
    }
  ],
  kin: [
    {
      question: 'Kwipima VIH bikorwa bite?',
      answer: 'Kwipima VIH bikorwa ukoresheje agapaki koroshye kandi bitanga igisubizo cya mbere mu ibanga. Kurikiza amabwiriza neza kandi ujye kwa muganga niba igisubizo kidasobanutse cyangwa kigaragaza ubwandu.'
    },
    {
      question: 'Nshobora gukoresha agakingirizo hamwe n’ubundi buryo bwo kuboneza urubyaro?',
      answer: 'Yego. Agakingirizo gashobora gukoreshwa hamwe n’ubundi buryo kugira ngo wongere ubwirinzi ku gutwita no ku ndwara zandurira mu mibonano mpuzabitsina.'
    },
    {
      question: 'Kwemera mu mubano bisobanuye iki?',
      answer: 'Kwemera bisobanuye ko buri muntu yemeye ku bushake, asobanukiwe ibiri kuba, kandi ashobora guhindura icyemezo igihe icyo ari cyo cyose.'
    },
    {
      question: 'Nakora iki iyo numva mpangayitse?',
      answer: 'Gerageza guhumeka buhoro, va ahagutera stress niba bishoboka, unywe amazi, kandi uganire n’uwo wizera niba uwo mutwaro ukomeza.'
    },
    {
      question: 'Pad ihindurwa nyuma y’igihe kingana iki?',
      answer: 'Abantu benshi bahindura pad nyuma y’amasaha 4 kugeza kuri 6, cyangwa mbere yayo niba yuzuye cyangwa itakoroheye.'
    }
  ],
  fr: [
    {
      question: 'Comment fonctionne l’autodépistage du VIH ?',
      answer: 'L’autodépistage du VIH utilise un kit simple et donne un premier résultat privé. Suivez bien les instructions et consultez un prestataire si le résultat est positif ou peu clair.'
    },
    {
      question: 'Puis-je utiliser un préservatif avec une autre contraception ?',
      answer: 'Oui. Le préservatif peut être utilisé avec une autre méthode pour renforcer la protection contre la grossesse et prévenir les IST.'
    },
    {
      question: 'Que signifie le consentement dans une relation ?',
      answer: 'Le consentement signifie que chaque personne accepte librement, comprend la situation et peut changer d’avis à tout moment.'
    },
    {
      question: 'Que puis-je faire quand je me sens anxieux ?',
      answer: 'Essayez une respiration lente, éloignez-vous du stress si possible, buvez de l’eau et parlez à une personne de confiance si le malaise persiste.'
    },
    {
      question: 'À quelle fréquence faut-il changer une serviette hygiénique ?',
      answer: 'Beaucoup de personnes la changent toutes les 4 à 6 heures, ou plus tôt si elle est pleine ou inconfortable.'
    }
  ]
};

const fallbackAnswers = {
  en: 'I am not a doctor. Please consult a verified provider on Nsobanuza.',
  kin: 'Ntabwo ndi muganga. Mwihutire kuvugana n’umutanga serivisi wemewe kuri Nsobanuza.',
  fr: 'Je ne suis pas médecin. Veuillez consulter un prestataire vérifié sur Nsobanuza.'
};

const readJson = (key, fallback = []) => {
  try {
    const storage = key === STORAGE_KEYS.chatHistory ? sessionStorage : localStorage;
    const value = JSON.parse(storage.getItem(key) || 'null');
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const detectLanguage = (message, fallbackLanguage) => {
  const text = message.toLowerCase();
  if (/(bonjour|préservatif|règles|anxi|dépression|consentement|comment)/.test(text)) {
    return 'fr';
  }
  if (/(amakuru|kwipima|imihango|agakingirizo|guhangayika|kwemera|mbese)/.test(text)) {
    return 'kin';
  }
  return fallbackLanguage;
};

const matchAnswer = (message, language) => {
  const text = message.toLowerCase();
  const answers = {
    hiv: {
      en: 'HIV self-testing gives a private first result. Read the kit instructions carefully and visit a verified provider if the result is positive, unclear, or if you want follow-up support.',
      kin: 'Kwipima VIH bitanga igisubizo cya mbere mu ibanga. Soma amabwiriza y’agapaki witonze kandi ujye ku mutanga serivisi wemewe niba igisubizo ari positive, kidasobanutse, cyangwa ushaka ubufasha bukurikira.',
      fr: 'L’autodépistage du VIH donne un premier résultat privé. Lisez attentivement le mode d’emploi et consultez un prestataire vérifié si le résultat est positif, peu clair ou si vous souhaitez un accompagnement.'
    },
    contraception: {
      en: 'Condoms can be combined with another contraceptive method for extra protection. If you want help choosing a method, talk to a verified SRH provider on Nsobanuza.',
      kin: 'Agakingirizo gashobora gukoreshwa hamwe n’ubundi buryo bwo kuboneza urubyaro kugira ngo wongere ubwirinzi. Niba ushaka guhitamo uburyo bukubereye, ganira n’umutanga serivisi wemewe wa SRH kuri Nsobanuza.',
      fr: 'Le préservatif peut être combiné avec une autre méthode contraceptive pour une protection supplémentaire. Si vous souhaitez choisir une méthode, parlez-en à un prestataire SRH vérifié sur Nsobanuza.'
    },
    consent: {
      en: 'Consent means every person freely agrees, understands what is happening, and can stop at any time. Silence or pressure is not consent.',
      kin: 'Kwemera bisobanuye ko buri muntu yemeye ku bushake, asobanukiwe ibiri kuba, kandi ashobora guhagarika igihe icyo ari cyo cyose. Guhora acecetse cyangwa gushyirwaho igitutu si ukwemera.',
      fr: 'Le consentement signifie que chaque personne accepte librement, comprend ce qui se passe et peut arrêter à tout moment. Le silence ou la pression ne sont pas un consentement.'
    },
    anxiety: {
      en: 'When anxiety rises, try slow breaths, name five things you can see, and reach out to someone you trust. If it keeps affecting daily life, speak to a mental health provider.',
      kin: 'Iyo guhangayika kwiyongereye, gerageza guhumeka buhoro, uvuge ibintu bitanu ureba, kandi uganire n’uwo wizera. Niba bikomeza kukubuza gukora ibikorwa bya buri munsi, vugana n’inzobere mu buzima bwo mu mutwe.',
      fr: 'Quand l’anxiété augmente, essayez de respirer lentement, nommez cinq choses que vous voyez et contactez une personne de confiance. Si cela perturbe votre quotidien, parlez à un professionnel de santé mentale.'
    },
    period: {
      en: 'Tracking your period can help you notice patterns. Many people change a pad every 4 to 6 hours and seek care if bleeding is unusually heavy or very painful.',
      kin: 'Gukurikirana imihango bifasha kubona uko uruziga rwawe rugenda. Abantu benshi bahindura pad nyuma y’amasaha 4 kugeza kuri 6 kandi basaba ubufasha niba kuva amaraso ari byinshi cyane cyangwa bibabaza cyane.',
      fr: 'Suivre vos règles peut aider à remarquer des habitudes. Beaucoup de personnes changent une serviette toutes les 4 à 6 heures et consultent si le saignement est très abondant ou très douloureux.'
    },
    depression: {
      en: 'Depression is treatable. Support may include talking to a professional, building a daily routine, and asking someone you trust to check in with you.',
      kin: 'Agahinda gakabije karavurwa. Ubufasha bushobora kuba ibiganiro n’inzobere, gukora gahunda ya buri munsi, no gusaba uwo wizera kujya akugenzura.',
      fr: 'La dépression se soigne. L’aide peut inclure des échanges avec un professionnel, une routine quotidienne et le soutien d’une personne de confiance.'
    }
  };

  if (/(hiv|vih|test)/.test(text)) return answers.hiv[language];
  if (/(condom|contrace|agakingirizo|préservatif|pill)/.test(text)) return answers.contraception[language];
  if (/(consent|kwemera|consentement|relationship)/.test(text)) return answers.consent[language];
  if (/(anxi|stress|guhangayika|panic)/.test(text)) return answers.anxiety[language];
  if (/(period|imihango|pad|règles|serviette)/.test(text)) return answers.period[language];
  if (/(depress|agahinda|dépression)/.test(text)) return answers.depression[language];
  return fallbackAnswers[language];
};

export function getLocalizedCopy(copy, language) {
  return copy?.[language] || copy?.en || '';
}

// localStorage drives the "free with ads" timer so the state survives refreshes.
export function getAdRemovalUntil() {
  const until = localStorage.getItem(STORAGE_KEYS.adsRemovedUntil);
  return until && new Date(until) > new Date() ? until : null;
}

export async function watchAdToRemoveAds() {
  const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  localStorage.setItem(STORAGE_KEYS.adsRemovedUntil, until);
  return delay(until, 1400);
}

export function getSponsoredBoost() {
  return localStorage.getItem(STORAGE_KEYS.sponsoredBoost) === 'true';
}

export function setSponsoredBoost(value) {
  localStorage.setItem(STORAGE_KEYS.sponsoredBoost, String(Boolean(value)));
}

export async function getHomeFeed({ search = '', category = 'allCategories', boostSponsored = false }) {
  const term = search.trim().toLowerCase();
  let feed = posts.filter((post) => {
    const matchesSearch =
      !term ||
      Object.values(post.caption).some((entry) => entry.toLowerCase().includes(term)) ||
      post.organization.toLowerCase().includes(term);
    const matchesCategory = category === 'allCategories' || post.category === category;
    return matchesSearch && matchesCategory;
  });

  if (boostSponsored) {
    feed = [...feed].sort((left, right) => Number(right.isSponsored) - Number(left.isSponsored));
  }

  return delay(feed);
}

export async function getVideos({ search = '', category = 'allCategories' }) {
  const term = search.trim().toLowerCase();
  const filtered = videos.filter((video) => {
    const matchesSearch =
      !term ||
      Object.values(video.title).some((entry) => entry.toLowerCase().includes(term)) ||
      Object.values(video.description).some((entry) => entry.toLowerCase().includes(term)) ||
      video.source.toLowerCase().includes(term);
    const matchesCategory = category === 'allCategories' || video.category === category;
    return matchesSearch && matchesCategory;
  });
  return delay(filtered);
}

export function findVideo(videoId) {
  return videos.find((video) => video.id === videoId) || null;
}

export async function getProviders() {
  return delay(providers);
}

export function getTrackingEntries() {
  return readJson(STORAGE_KEYS.trackingEntries, []);
}

export function getPredictedNextPeriod() {
  const entries = getTrackingEntries();
  if (!entries.length) return null;
  const latest = [...entries].sort(
    (left, right) => new Date(right.periodStartDate) - new Date(left.periodStartDate)
  )[0];
  const next = new Date(latest.periodStartDate);
  next.setDate(next.getDate() + 28);
  return next.toISOString();
}

export async function saveTrackingEntry(entry) {
  const entries = getTrackingEntries();
  const nextEntries = [
    {
      id: `tracking-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...entry
    },
    ...entries
  ];
  localStorage.setItem(STORAGE_KEYS.trackingEntries, JSON.stringify(nextEntries));
  return delay(nextEntries);
}

export function getChatHistory() {
  const history = readJson(STORAGE_KEYS.chatHistory, []);
  return history.length
    ? history
    : [
        {
          id: 'intro',
          role: 'assistant',
          text: {
            en: 'Nsobo is here for youth-friendly health information. Ask about SRH, consent, mental health, periods, or relationships.',
            kin: 'Nsobo iri hano kugira ngo iguhe amakuru yorohereza urubyiruko ku buzima. Baza kuri SRH, kwemera, ubuzima bwo mu mutwe, imihango, cyangwa imibanire.',
            fr: 'Nsobo est là pour fournir des informations de santé adaptées aux jeunes. Posez des questions sur la SSR, le consentement, la santé mentale, les règles ou les relations.'
          }
        }
      ];
}

export function saveChatHistory(history) {
  sessionStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(history));
}

export function getChatExamples(language) {
  return exampleQuestions[language] || exampleQuestions.en;
}

// sessionStorage keeps the current chat thread while the tab stays open.
export async function answerChat(message, preferredLanguage) {
  const language = detectLanguage(message, preferredLanguage);
  return delay(
    {
      language,
      answer: matchAnswer(message, language)
    },
    220
  );
}
