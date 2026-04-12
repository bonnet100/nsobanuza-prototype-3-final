require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { pool, initDb } = require('./db');
const { getPlatformSettings, updatePlatformSettings } = require('./utils/platformSettings');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());
const PORT = Number(process.env.PORT || 5000);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env.');
  process.exit(1);
}

const consultationChannels = {
  text: 'text_chat_price',
  voice: 'voice_chat_price',
  video: 'video_chat_price'
};

function toNumber(value) {
  return Number(value || 0);
}

function parseMoney(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function createProfessionalUsername(value) {
  return `pro_${String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')}`;
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username || null,
    fullName: user.full_name || null,
    displayName: user.full_name || user.username || user.email || 'Nsobanuza User',
    email: user.email || null,
    phone: user.phone || null,
    role: user.role,
    verified: Boolean(user.verified),
    isActive: user.is_active !== false,
    organisation: user.organisation || null,
    specialty: user.specialty || null,
    licenseNumber: user.license_number || null,
    idCardNumber: user.id_card_number || null,
    kycStatus: user.kyc_status || 'pending',
    bio: user.bio || '',
    textChatPrice: toNumber(user.text_chat_price),
    voiceChatPrice: toNumber(user.voice_chat_price),
    videoChatPrice: toNumber(user.video_chat_price),
    averageRating: toNumber(user.average_rating),
    reviewCount: Number(user.review_count || 0),
    adRemovalExpiresAt: user.ad_removal_expires_at || null
  };
}

function publicPost(post) {
  return {
    id: post.id,
    authorId: post.author_id || null,
    authorName: post.author_name,
    category: post.category || 'General',
    content: post.content,
    mediaUrl: post.media_url || null,
    mediaType: post.media_type || 'image',
    isSponsored: Boolean(post.is_sponsored),
    status: post.status,
    ctaLabel: post.cta_label || '',
    ctaUrl: post.cta_url || '',
    createdAt: post.created_at
  };
}

function publicVideo(video) {
  return {
    id: video.id,
    title: video.title,
    description: video.description || '',
    url: video.url,
    category: video.category || 'General',
    thumbnail: video.thumbnail || '',
    createdBy: video.created_by || 'Nsobanuza',
    approved: Boolean(video.approved),
    isPartnerAd: Boolean(video.is_partner_ad),
    mutedByDefault: video.muted_by_default !== false,
    createdAt: video.created_at
  };
}

function publicBook(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    summary: book.summary || '',
    description: book.description || book.summary || '',
    category: book.category || 'General',
    url: book.url,
    coverImage: book.cover_image || '',
    createdAt: book.created_at
  };
}

function publicReview(review) {
  return {
    id: review.id,
    consultationId: review.consultation_id || null,
    rating: Number(review.rating || 0),
    comment: review.comment || '',
    createdAt: review.created_at,
    reviewerName: review.reviewer_name || review.username || 'Nsobanuza user'
  };
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  return jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;
    return next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  return next();
};

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'nsobanuza-backend' });
});

app.post('/auth/register', async (req, res) => {
  const { phone, username, password } = req.body || {};

  if (!phone || !username || !password) {
    return res.status(400).json({ error: 'Phone, username, and password are required.' });
  }

  try {
    const existingProfessional = await pool.query(
      `SELECT id FROM users
       WHERE LOWER(email) = LOWER($1) OR license_number = $2
       LIMIT 1`,
      [email.trim().toLowerCase(), licenseNumber.trim()]
    );

    if (existingProfessional.rows[0]) {
      return res.status(400).json({ error: 'That email or license number is already in use.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (phone, username, password, role, verified, is_active, kyc_status)
       VALUES ($1, $2, $3, 'user', true, true, 'approved')
       RETURNING *`,
      [phone.trim(), username.trim(), hashed]
    );

    return res.json({
      success: true,
      message: 'Account created successfully. Log in with your username and password.',
      user: publicUser(result.rows[0])
    });
  } catch (err) {
    console.error('Registration Error:', err.message);
    const duplicate = err.code === '23505';
    return res
      .status(400)
      .json({ error: duplicate ? 'Username or phone number already exists.' : 'Registration failed.' });
  }
});

app.post('/auth/register-professional', async (req, res) => {
  const {
    fullName,
    email,
    password,
    licenseNumber,
    idCardNumber,
    organisation,
    specialty,
    licenseDocument,
    bio,
    textChatPrice,
    voiceChatPrice,
    videoChatPrice
  } = req.body || {};

  if (!fullName || !email || !password || !licenseNumber || !idCardNumber) {
    return res.status(400).json({
      error: 'Full name, email, password, license number, and ID card number are required.'
    });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (
        username,
        full_name,
        email,
        password,
        role,
        verified,
        is_active,
        license_number,
        organisation,
        specialty,
        license_document,
        id_card_number,
        kyc_status,
        bio,
        text_chat_price,
        voice_chat_price,
        video_chat_price
      ) VALUES (
        $1, $2, $3, $4, 'professional', false, true, $5, $6, $7, $8, $9, 'pending', $10, $11, $12, $13
      )
      RETURNING *`,
      [
        createProfessionalUsername(licenseNumber.trim()),
        fullName.trim(),
        email.trim().toLowerCase(),
        hashed,
        licenseNumber.trim(),
        organisation?.trim() || '',
        specialty?.trim() || 'General Health',
        licenseDocument?.trim() || '',
        idCardNumber.trim(),
        bio?.trim() || '',
        parseMoney(textChatPrice),
        parseMoney(voiceChatPrice),
        parseMoney(videoChatPrice)
      ]
    );

    return res.json({
      success: true,
      message: 'Professional registration submitted. Admin review and KYC approval are required before verification.',
      user: publicUser(result.rows[0])
    });
  } catch (err) {
    console.error('Professional Registration Error:', err.message);
    const duplicate = err.code === '23505';
    return res
      .status(400)
      .json({ error: duplicate ? 'That email or license number is already in use.' : 'Registration failed.' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { identifier, password, accountType = 'user' } = req.body || {};

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required.' });
  }

  const lookupField = accountType === 'professional' ? 'email' : 'username';

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE LOWER(${lookupField}) = LOWER($1) LIMIT 1`,
      [String(identifier).trim()]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    if (accountType === 'professional' && user.role !== 'professional') {
      return res.status(403).json({ error: 'Use the user login form for this account.' });
    }

    const token = createToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Unable to log in right now.' });
  }
});

app.get('/auth/me', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [req.user.id]);
  return res.json({ user: result.rows[0] ? publicUser(result.rows[0]) : null });
});

app.get('/posts', async (_req, res) => {
  const result = await pool.query(
    "SELECT * FROM posts WHERE status = 'approved' ORDER BY created_at DESC"
  );
  return res.json({ posts: result.rows.map(publicPost) });
});

app.post('/posts', authenticateToken, async (req, res) => {
  if (!['professional', 'admin'].includes(req.user.role)) {
    return res.sendStatus(403);
  }

  const { content, category, mediaUrl, mediaType, ctaLabel, ctaUrl, isSponsored } = req.body || {};
  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: 'Post content is required.' });
  }

  const authorResult = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [req.user.id]);
  const author = authorResult.rows[0];

  const result = await pool.query(
    `INSERT INTO posts (
      author_id,
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
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING *`,
    [
      req.user.id,
      author.organisation || author.full_name || author.username || 'Nsobanuza Professional',
      category || 'General',
      String(content).trim(),
      mediaUrl || '',
      mediaType || 'image',
      req.user.role === 'admin' ? Boolean(isSponsored) : false,
      req.user.role === 'admin' ? 'approved' : 'pending',
      ctaLabel || '',
      ctaUrl || ''
    ]
  );

  return res.json({
    success: true,
    post: publicPost(result.rows[0]),
    message:
      req.user.role === 'admin'
        ? 'Post published successfully.'
        : 'Post submitted for admin review.'
  });
});

app.get('/videos', async (_req, res) => {
  const result = await pool.query(
    'SELECT * FROM videos WHERE approved = true ORDER BY created_at DESC'
  );
  return res.json({ videos: result.rows.map(publicVideo) });
});

app.get('/books', async (_req, res) => {
  const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
  return res.json({ books: result.rows.map(publicBook) });
});

app.get('/providers', async (req, res) => {
  const { specialty } = req.query;
  const params = [];
  let query = `
    SELECT *
    FROM users
    WHERE role = 'professional' AND verified = true AND is_active = true
  `;

  if (specialty && specialty !== 'All') {
    params.push(specialty);
    query += ` AND specialty = $${params.length}`;
  }

  query += ' ORDER BY average_rating DESC NULLS LAST, created_at DESC';

  const result = await pool.query(query, params);
  return res.json({
    providers: result.rows.map((provider) => ({
      ...publicUser(provider)
    }))
  });
});

app.get('/providers/:id/reviews', async (req, res) => {
  const result = await pool.query(
    `SELECT pr.*, COALESCE(u.full_name, u.username, 'Nsobanuza user') AS reviewer_name
     FROM provider_reviews pr
     LEFT JOIN users u ON u.id = pr.user_id
     WHERE professional_id = $1
     ORDER BY pr.created_at DESC`,
    [req.params.id]
  );
  return res.json({ reviews: result.rows.map(publicReview) });
});

app.post('/providers/consultations/request', authenticateToken, async (req, res) => {
  if (!['user', 'admin'].includes(req.user.role)) {
    return res.sendStatus(403);
  }

  const { professionalId, message, consultationType = 'text' } = req.body || {};
  if (!professionalId || !message || !consultationChannels[consultationType]) {
    return res.status(400).json({ error: 'Professional, message, and consultation type are required.' });
  }

  const providerResult = await pool.query(
    `SELECT * FROM users
     WHERE id = $1 AND role = 'professional' AND verified = true AND is_active = true
     LIMIT 1`,
    [professionalId]
  );
  const provider = providerResult.rows[0];

  if (!provider) {
    return res.status(404).json({ error: 'Provider not found.' });
  }

  const price = toNumber(provider[consultationChannels[consultationType]]);

  const result = await pool.query(
    `INSERT INTO consultations (user_id, professional_id, channel, price, status, message, created_at)
     VALUES ($1, $2, $3, $4, 'requested', $5, NOW())
     RETURNING *`,
    [req.user.id, professionalId, consultationType, price, String(message).trim()]
  );

  return res.json({
    success: true,
    consultation: result.rows[0],
    price,
    message: 'Consultation requested successfully.'
  });
});

app.get('/consultations', authenticateToken, async (req, res) => {
  const field = req.user.role === 'professional' ? 'professional_id' : 'user_id';
  const result = await pool.query(
    `SELECT
      c.*,
      COALESCE(u.full_name, u.username, u.email) AS user_name,
      COALESCE(p.full_name, p.organisation, p.email) AS professional_name,
      pr.id AS review_id,
      pr.rating AS review_rating,
      pr.comment AS review_comment
     FROM consultations c
     LEFT JOIN users u ON u.id = c.user_id
     LEFT JOIN users p ON p.id = c.professional_id
     LEFT JOIN provider_reviews pr ON pr.consultation_id = c.id
     WHERE c.${field} = $1
     ORDER BY c.created_at DESC`,
    [req.user.id]
  );

  return res.json({ consultations: result.rows });
});

app.patch('/consultations/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body || {};
  const allowed = ['requested', 'scheduled', 'completed', 'declined'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const consultationResult = await pool.query(
    'SELECT * FROM consultations WHERE id = $1 LIMIT 1',
    [req.params.id]
  );
  const consultation = consultationResult.rows[0];

  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found.' });
  }

  const ownsConsultation =
    req.user.role === 'admin' ||
    consultation.user_id === req.user.id ||
    consultation.professional_id === req.user.id;

  if (!ownsConsultation) {
    return res.sendStatus(403);
  }

  await pool.query('UPDATE consultations SET status = $1 WHERE id = $2', [status, req.params.id]);
  return res.json({ success: true });
});

app.post('/providers/:id/reviews', authenticateToken, async (req, res) => {
  if (!['user', 'admin'].includes(req.user.role)) {
    return res.sendStatus(403);
  }

  const { consultationId, rating, comment } = req.body || {};
  const numericRating = Number(rating);

  if (!consultationId || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'A consultation and rating between 1 and 5 are required.' });
  }

  const consultationResult = await pool.query(
    `SELECT * FROM consultations
     WHERE id = $1 AND user_id = $2 AND professional_id = $3
     LIMIT 1`,
    [consultationId, req.user.id, req.params.id]
  );
  const consultation = consultationResult.rows[0];

  if (!consultation) {
    return res.status(404).json({ error: 'Consultation not found for this provider.' });
  }

  await pool.query(
    `INSERT INTO provider_reviews (consultation_id, user_id, professional_id, rating, comment, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (consultation_id)
     DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = NOW()`,
    [consultationId, req.user.id, req.params.id, numericRating, comment || '']
  );

  const aggregate = await pool.query(
    'SELECT AVG(rating)::numeric(3,2) AS average_rating, COUNT(*) AS review_count FROM provider_reviews WHERE professional_id = $1',
    [req.params.id]
  );

  await pool.query(
    'UPDATE users SET average_rating = $1, review_count = $2 WHERE id = $3',
    [
      aggregate.rows[0].average_rating || 0,
      Number(aggregate.rows[0].review_count || 0),
      req.params.id
    ]
  );

  return res.json({ success: true });
});

app.post('/tracking', authenticateToken, async (req, res) => {
  const { period_start_date, mood, symptoms } = req.body || {};
  if (!period_start_date || !mood || !symptoms) {
    return res.status(400).json({ error: 'Period date, mood, and symptoms are required.' });
  }

  try {
    await pool.query(
      'INSERT INTO tracking_logs (user_id, period_start_date, mood, symptoms) VALUES ($1, $2, $3, $4)',
      [req.user.id, period_start_date, mood, symptoms]
    );
    return res.json({ success: true, message: 'Record saved.' });
  } catch (err) {
    console.error('Tracking save error:', err.message);
    return res.status(500).json({ error: 'Failed to save record.' });
  }
});

app.get('/tracking/predict', authenticateToken, async (req, res) => {
  const result = await pool.query(
    'SELECT period_start_date, mood FROM tracking_logs WHERE user_id = $1 ORDER BY period_start_date ASC',
    [req.user.id]
  );
  const rows = result.rows;

  if (rows.length === 0) {
    return res.json({
      prediction: null,
      nextPeriodDate: null,
      averageCycleLength: null,
      fertileWindow: null,
      regularityScore: null,
      advice: 'Log your first period date so Nsobanuza can start learning your cycle.'
    });
  }

  const dates = rows.map((item) => new Date(item.period_start_date));
  const cycles = [];
  for (let index = 1; index < dates.length; index += 1) {
    const diffDays = Math.round((dates[index] - dates[index - 1]) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      cycles.push(diffDays);
    }
  }

  const averageCycleLength = cycles.length
    ? Math.round(cycles.reduce((sum, value) => sum + value, 0) / cycles.length)
    : 28;
  const latestDate = dates[dates.length - 1];
  const nextPeriodDate = new Date(latestDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + averageCycleLength);

  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() - 14);

  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 5);

  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  const variance =
    cycles.length > 1
      ? cycles.reduce((sum, value) => sum + Math.pow(value - averageCycleLength, 2), 0) / cycles.length
      : 0;
  const regularityScore = Math.max(45, Math.min(98, Math.round(100 - Math.sqrt(variance) * 3)));

  let advice = 'Nsobanuza is learning your cycle and will improve predictions as you add more logs.';
  if (cycles.length >= 2 && averageCycleLength >= 25 && averageCycleLength <= 35) {
    advice =
      'Your recent cycle pattern looks fairly consistent. Keep logging mood and symptoms so Nsobanuza can spot changes early.';
  } else if (cycles.length >= 2) {
    advice =
      'Your cycle shows some variation. This can be normal, but if irregularity continues or symptoms become severe, consider speaking with a verified provider.';
  }

  return res.json({
    prediction: `Next period around ${nextPeriodDate.toDateString()}`,
    nextPeriodDate,
    averageCycleLength,
    fertileWindow: {
      start: fertileStart,
      end: fertileEnd
    },
    regularityScore,
    advice
  });
});

app.get('/tracking/:user_id', authenticateToken, async (req, res) => {
  if (Number(req.params.user_id) !== req.user.id && req.user.role !== 'admin') {
    return res.sendStatus(403);
  }

  const result = await pool.query(
    'SELECT * FROM tracking_logs WHERE user_id = $1 ORDER BY period_start_date DESC',
    [req.params.user_id]
  );
  return res.json({ logs: result.rows });
});

app.post('/ad-removal/watch', authenticateToken, async (req, res) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query('UPDATE users SET ad_removal_expires_at = $1 WHERE id = $2', [expiresAt, req.user.id]);
  await pool.query(
    `INSERT INTO ad_removal (user_id, expires_at)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET expires_at = EXCLUDED.expires_at`,
    [req.user.id, expiresAt]
  );

  return res.json({ expires_at: expiresAt });
});

app.get('/admin/overview', authenticateToken, requireAdmin, async (_req, res) => {
  const [total, pending, active, posts, partnerVideos] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM users'),
    pool.query("SELECT COUNT(*) FROM users WHERE role = 'professional' AND verified = false"),
    pool.query("SELECT COUNT(*) FROM users WHERE is_active = true"),
    pool.query("SELECT COUNT(*) FROM posts WHERE status = 'pending'"),
    pool.query("SELECT COUNT(*) FROM videos WHERE is_partner_ad = true")
  ]);

  return res.json({
    overview: {
      totalUsers: Number(total.rows[0].count),
      pendingProfessionals: Number(pending.rows[0].count),
      activeUsers: Number(active.rows[0].count),
      pendingPosts: Number(posts.rows[0].count),
      partnerVideos: Number(partnerVideos.rows[0].count)
    }
  });
});

app.get('/admin/users', authenticateToken, requireAdmin, async (_req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return res.json({ users: result.rows.map(publicUser) });
});

app.get('/admin/professionals/pending', authenticateToken, requireAdmin, async (_req, res) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE role = 'professional' AND verified = false ORDER BY created_at DESC"
  );
  return res.json({ professionals: result.rows.map(publicUser) });
});

app.post('/admin/professionals/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  await pool.query(
    "UPDATE users SET verified = true, kyc_status = 'approved' WHERE id = $1 AND role = 'professional'",
    [req.params.id]
  );
  return res.json({ success: true });
});

app.patch('/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { isActive } = req.body || {};
  await pool.query('UPDATE users SET is_active = $1 WHERE id = $2', [Boolean(isActive), req.params.id]);
  return res.json({ success: true });
});

app.get('/admin/posts', authenticateToken, requireAdmin, async (_req, res) => {
  const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
  return res.json({ posts: result.rows.map(publicPost) });
});

app.get('/admin/posts/pending', authenticateToken, requireAdmin, async (_req, res) => {
  const result = await pool.query(
    "SELECT * FROM posts WHERE status = 'pending' ORDER BY created_at DESC"
  );
  return res.json({ posts: result.rows.map(publicPost) });
});

app.post('/admin/posts/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  await pool.query("UPDATE posts SET status = 'approved' WHERE id = $1", [req.params.id]);
  return res.json({ success: true });
});

app.post('/admin/videos', authenticateToken, requireAdmin, async (req, res) => {
  const { title, description, url, category, thumbnail, createdBy, isPartnerAd = true } = req.body || {};

  if (!title || !url) {
    return res.status(400).json({ error: 'Video title and URL are required.' });
  }

  const result = await pool.query(
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
    ) VALUES ($1, $2, $3, $4, $5, $6, true, $7, true, NOW())
    RETURNING *`,
    [
      title,
      description || '',
      url,
      category || 'General',
      thumbnail || '',
      createdBy || 'Partner Campaign',
      Boolean(isPartnerAd)
    ]
  );

  return res.json({ success: true, video: publicVideo(result.rows[0]) });
});

app.get('/admin/videos', authenticateToken, requireAdmin, async (_req, res) => {
  const result = await pool.query('SELECT * FROM videos ORDER BY created_at DESC');
  return res.json({ videos: result.rows.map(publicVideo) });
});

app.get('/admin/platform-settings', authenticateToken, requireAdmin, async (_req, res) => {
  const settings = await getPlatformSettings();
  return res.json({ settings });
});

app.patch('/admin/platform-settings', authenticateToken, requireAdmin, async (req, res) => {
  const { chatbotEnabled, aiProviderPreference, ollamaModel, geminiModel, openaiModel, huggingFaceModel } = req.body || {};
  const settings = await updatePlatformSettings({
    chatbotEnabled,
    aiProviderPreference,
    ollamaModel,
    geminiModel,
    openaiModel,
    huggingFaceModel
  });

  return res.json({ success: true, settings });
});

app.use('/chat', authenticateToken, require('./chat'));

const startServer = async () => {
  await initDb();
  const server = app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} is already in use. Stop the existing backend process or change PORT in backend/.env before starting this server again.`
      );
      process.exit(1);
    }

    console.error('Failed to start backend server:', error);
    process.exit(1);
  });
};

startServer();
