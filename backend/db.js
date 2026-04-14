const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'))
      ? false
      : { rejectUnauthorized: false }
});

const demoProviders = [
  {
    full_name: 'Dr. Aline Uwase',
    email: 'aline.uwase@nsobanuza.rw',
    specialty: 'Sexual Health',
    organisation: 'Kigali Youth Care Centre',
    license_number: 'RMC-SRH-20441',
    id_card_number: '1199980076543021',
    bio: 'Certified clinician supporting youth-friendly SRH counselling, contraception guidance, and HIV prevention.',
    text_chat_price: 2500,
    voice_chat_price: 5000,
    video_chat_price: 8000
  },
  {
    full_name: 'Counsellor Diane Mukamana',
    email: 'diane.mukamana@nsobanuza.rw',
    specialty: 'Mental Health',
    organisation: 'Ubuntu Mind Clinic',
    license_number: 'PSY-RW-88213',
    id_card_number: '1199880044441137',
    bio: 'Mental wellness counsellor focused on anxiety, stress, relationships, and confidence building for adolescents.',
    text_chat_price: 2000,
    voice_chat_price: 4500,
    video_chat_price: 7000
  },
  {
    full_name: 'Midwife Clarisse Ingabire',
    email: 'clarisse.ingabire@nsobanuza.rw',
    specialty: 'Period Health',
    organisation: 'Women First Wellness Hub',
    license_number: 'MID-RW-77551',
    id_card_number: '1199960012304498',
    bio: 'Midwife supporting menstrual health tracking, fertility awareness, and adolescent reproductive wellbeing.',
    text_chat_price: 2200,
    voice_chat_price: 4800,
    video_chat_price: 7600
  }
];

const seedPosts = [
  {
    author_name: 'Rwanda Biomedical Centre',
    category: 'Sexual Health',
    content:
      'Understanding HIV prevention starts with facts, not fear. Condom use, regular testing, and open conversations with a trusted provider can reduce risk and protect your future.',
    media_url:
      'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    is_sponsored: false,
    cta_label: 'Learn about HIV prevention',
    cta_url: '/app/library'
  },
  {
    author_name: 'Youth SafeSpace Rwanda',
    category: 'Mental Health',
    content:
      'Stress can show up as tiredness, headaches, or feeling distant from people you care about. Small daily habits like sleep, hydration, journaling, and asking for help early make a real difference.',
    media_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    is_sponsored: false,
    cta_label: 'Explore wellness tips',
    cta_url: '/app/library'
  },
  {
    author_name: 'Nsobanuza Partner Spotlight',
    category: 'Period Health',
    content:
      'Free mode keeps Nsobanuza open for everyone through trusted sponsor campaigns. Watch this partner-supported health clip to unlock an ad-light experience for 24 hours.',
    media_url:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    is_sponsored: true,
    cta_label: 'Watch sponsor video',
    cta_url: '/app/library'
  }
];

const seedVideos = [
  {
    title: 'Healthy conversations about consent',
    description:
      'A short youth-friendly video about consent, boundaries, and safer relationships.',
    url:
      'https://cdn.coverr.co/videos/coverr-african-doctor-checking-patient-1574/1080p.mp4',
    category: 'Sexual Health',
    thumbnail:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
    created_by: 'Nsobanuza Media',
    is_partner_ad: false
  },
  {
    title: 'Checking in with your mental health',
    description:
      'A calm, supportive video encouraging self-awareness, rest, and reaching out when emotions feel heavy.',
    url:
      'https://cdn.coverr.co/videos/coverr-african-woman-working-at-home-5078/1080p.mp4',
    category: 'Mental Health',
    thumbnail:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    created_by: 'Nsobanuza Media',
    is_partner_ad: false
  },
  {
    title: 'Partner campaign: period confidence essentials',
    description:
      'A sponsor-supported educational video about preparation, comfort, and confidence during a menstrual cycle.',
    url:
      'https://cdn.coverr.co/videos/coverr-female-doctor-in-a-hospital-1565349194328/1080p.mp4',
    category: 'Period Health',
    thumbnail:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80',
    created_by: 'Partner Campaign',
    is_partner_ad: true
  }
];

const seedBooks = [
  {
    title: 'Youth Guide to Sexual and Reproductive Health',
    author: 'Nsobanuza Editorial Team',
    summary:
      'A practical beginner guide to contraception, HIV prevention, consent, and respectful relationships.',
    description:
      'This library guide explains essential sexual and reproductive health topics for young people using stigma-free language and practical examples.',
    category: 'Sexual Health',
    url: 'https://www.unfpa.org/sites/default/files/pub-pdf/UNFPA_PUB_2014_EN_SWP.pdf',
    cover_image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Understanding Stress and Emotional Wellness',
    author: 'Community Wellness Desk',
    summary:
      'Learn how to identify stress patterns, build coping routines, and reach out for support early.',
    description:
      'A supportive reading resource focused on emotional awareness, coping tools, and healthy routines for daily wellbeing.',
    category: 'Mental Health',
    url: 'https://www.who.int/publications/i/item/9789240036703',
    cover_image:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Menstrual Tracking and Body Literacy',
    author: 'Women First Wellness Hub',
    summary:
      'An easy introduction to period patterns, fertile windows, cycle irregularities, and care preparation.',
    description:
      'This guide helps users understand their cycle data, notice changes over time, and know when to consult a professional.',
    category: 'Period Health',
    url: 'https://www.unicef.org/media/91341/file/Guidance-menstrual-health-hygiene-2021.pdf',
    cover_image:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'
  }
];

const defaultPlatformSettings = [
  ['chatbot_enabled', 'true'],
  ['ai_provider_preference', process.env.AI_PROVIDER_PREFERENCE || 'auto'],
  ['ollama_model', process.env.OLLAMA_MODEL || 'qwen2.5:3b'],
  ['gemini_model', process.env.GEMINI_MODEL || 'gemini-2.5-flash'],
  ['xai_model', process.env.XAI_MODEL || 'grok-3-mini'],
  ['openai_model', process.env.OPENAI_MODEL || 'gpt-5-mini'],
  ['huggingface_model', process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct']
];

function createProfessionalUsername(value) {
  return `pro_${String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')}`;
}

async function ensureAdminUser() {
  const adminUsername = String(process.env.ADMIN_USERNAME || 'admin').trim();
  const adminPassword = String(process.env.ADMIN_PASSWORD || 'Admin123!').trim();
  const adminPhone = String(process.env.ADMIN_PHONE || '+250780000000').trim();

  const existingAdmin = await pool.query(
    'SELECT id FROM users WHERE LOWER(username) = LOWER($1) OR role = $2 LIMIT 1',
    [adminUsername, 'admin']
  );

  if (existingAdmin.rows.length > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await pool.query(
    `INSERT INTO users (
      phone, username, password, role, verified, is_active, kyc_status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [adminPhone, adminUsername, passwordHash, 'admin', true, true, 'approved']
  );
}

async function seedProviders() {
  const passwordHash = await bcrypt.hash('Provider123!', 10);

  for (const provider of demoProviders) {
    await pool.query(
      `INSERT INTO users (
        username,
        full_name,
        email,
        password,
        role,
        verified,
        is_active,
        phone,
        license_number,
        organisation,
        specialty,
        id_card_number,
        kyc_status,
        bio,
        text_chat_price,
        voice_chat_price,
        video_chat_price,
        created_at
      )
      VALUES (
        $1, $2, $3, $4, 'professional', true, true, NULL, $5, $6, $7, $8, 'approved',
        $9, $10, $11, $12, NOW()
      )
      ON CONFLICT DO NOTHING`,
      [
        createProfessionalUsername(provider.license_number),
        provider.full_name,
        provider.email,
        passwordHash,
        provider.license_number,
        provider.organisation,
        provider.specialty,
        provider.id_card_number,
        provider.bio,
        provider.text_chat_price,
        provider.voice_chat_price,
        provider.video_chat_price
      ]
    );
  }
}

async function seedContent() {
  const postsCount = await pool.query('SELECT COUNT(*) FROM posts');
  if (Number(postsCount.rows[0].count) === 0) {
    for (const post of seedPosts) {
      await pool.query(
        `INSERT INTO posts (
          author_name,
          category,
          content,
          media_url,
          media_type,
          is_sponsored,
          status,
          cta_label,
          cta_url,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'approved', $7, $8, NOW())`,
        [
          post.author_name,
          post.category,
          post.content,
          post.media_url,
          post.media_type,
          post.is_sponsored,
          post.cta_label,
          post.cta_url
        ]
      );
    }
  }

  const videosCount = await pool.query('SELECT COUNT(*) FROM videos');
  if (Number(videosCount.rows[0].count) === 0) {
    for (const video of seedVideos) {
      await pool.query(
        `INSERT INTO videos (
          title,
          description,
          url,
          category,
          thumbnail,
          created_by,
          approved,
          is_partner_ad,
          muted_by_default,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, true, $7, true, NOW())`,
        [
          video.title,
          video.description,
          video.url,
          video.category,
          video.thumbnail,
          video.created_by,
          video.is_partner_ad
        ]
      );
    }
  }

  const booksCount = await pool.query('SELECT COUNT(*) FROM books');
  if (Number(booksCount.rows[0].count) === 0) {
    for (const book of seedBooks) {
      await pool.query(
        `INSERT INTO books (
          title,
          author,
          summary,
          description,
          category,
          url,
          cover_image,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          book.title,
          book.author,
          book.summary,
          book.description,
          book.category,
          book.url,
          book.cover_image
        ]
      );
    }
  }
}

async function seedBasicUser() {
  const existingUser = await pool.query("SELECT id FROM users WHERE role = 'user' LIMIT 1");
  if (existingUser.rows.length > 0) {
    return;
  }

  const hashedPass = await bcrypt.hash('Nsobanuza123!', 10);
  await pool.query(
    `INSERT INTO users (
      phone,
      username,
      password,
      role,
      verified,
      is_active,
      kyc_status,
      created_at
    ) VALUES ($1, $2, $3, 'user', true, true, 'approved', NOW())`,
    ['+250781000001', 'amanzi', hashedPass]
  );
}

async function seedPlatformSettings() {
  for (const [key, value] of defaultPlatformSettings) {
    await pool.query(
      `INSERT INTO platform_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }
}

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone TEXT UNIQUE,
        username TEXT,
        email TEXT,
        full_name TEXT,
        password TEXT,
        role TEXT DEFAULT 'user',
        verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        license_number TEXT UNIQUE,
        organisation TEXT,
        license_document TEXT,
        specialty TEXT,
        id_card_number TEXT,
        kyc_status TEXT DEFAULT 'pending',
        bio TEXT,
        text_chat_price NUMERIC(10, 2) DEFAULT 0,
        voice_chat_price NUMERIC(10, 2) DEFAULT 0,
        video_chat_price NUMERIC(10, 2) DEFAULT 0,
        average_rating NUMERIC(3, 2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        ad_removal_expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        author_id INTEGER,
        author_name TEXT,
        category TEXT,
        content TEXT,
        media_url TEXT,
        media_type TEXT,
        is_sponsored BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'approved',
        cta_label TEXT,
        cta_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title TEXT,
        description TEXT,
        url TEXT,
        category TEXT,
        thumbnail TEXT,
        created_by TEXT,
        approved BOOLEAN DEFAULT TRUE,
        is_partner_ad BOOLEAN DEFAULT FALSE,
        muted_by_default BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title TEXT,
        author TEXT,
        summary TEXT,
        description TEXT,
        category TEXT,
        url TEXT,
        cover_image TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tracking_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        period_start_date DATE,
        mood TEXT,
        symptoms TEXT,
        logged_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        professional_id INTEGER,
        channel TEXT DEFAULT 'text',
        price NUMERIC(10, 2) DEFAULT 0,
        status TEXT DEFAULT 'requested',
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS provider_reviews (
        id SERIAL PRIMARY KEY,
        consultation_id INTEGER UNIQUE,
        user_id INTEGER,
        professional_id INTEGER,
        rating INTEGER,
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS ad_removal (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE,
        expires_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS platform_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS id_card_number TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending';`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS text_chat_price NUMERIC(10, 2) DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS voice_chat_price NUMERIC(10, 2) DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS video_chat_price NUMERIC(10, 2) DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ad_removal_expires_at TIMESTAMPTZ;`);

    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT;`);
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';`);
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS cta_label TEXT;`);
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS cta_url TEXT;`);

    await pool.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT;`);
    await pool.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS created_by TEXT;`);
    await pool.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT TRUE;`);
    await pool.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_partner_ad BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS muted_by_default BOOLEAN DEFAULT TRUE;`);
    await pool.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();`);

    await pool.query(`ALTER TABLE books ADD COLUMN IF NOT EXISTS description TEXT;`);
    await pool.query(`ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image TEXT;`);

    await pool.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'text';`);
    await pool.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;`);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique
      ON users (LOWER(username))
      WHERE username IS NOT NULL;
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
      ON users (LOWER(email))
      WHERE email IS NOT NULL;
    `);

    await seedBasicUser();
    await seedPlatformSettings();
    await ensureAdminUser();
    await seedProviders();
    await seedContent();

    console.log('Successfully connected and initialized Nsobanuza database');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

module.exports = {
  pool,
  initDb
};
