const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const router = express.Router();

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const phone = String(req.body.phone || '').trim();
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();

  if (!phone || !username || !password) {
    return res.status(400).json({ error: 'Phone, username, and password are required.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existing) {
    return res.status(409).json({ error: 'Phone number already in use.' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const result = db.prepare(`INSERT INTO users (phone, username, password_hash, role, verified, created_at)
    VALUES (?, ?, ?, 'user', 0, ?)`)
    .run(phone, username, password_hash, new Date().toISOString());

  const user = db.prepare('SELECT id, phone, username, role, verified FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.json({ token: signToken(user), user });
});

router.post('/register-professional', async (req, res) => {
  const phone = String(req.body.phone || '').trim();
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();
  const license_number = String(req.body.license_number || '').trim();
  const organisation = String(req.body.organisation || '').trim();
  const license_document = String(req.body.license_document || '').trim();
  const specialty = String(req.body.specialty || '').trim();

  if (!phone || !username || !password || !license_number || !organisation || !specialty) {
    return res.status(400).json({ error: 'All professional fields are required.' });
  }

  const phoneExists = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (phoneExists) {
    return res.status(409).json({ error: 'Phone number already in use.' });
  }

  const licenseExists = db.prepare('SELECT id FROM users WHERE license_number = ?').get(license_number);
  if (licenseExists) {
    return res.status(409).json({ error: 'License number already in use.' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const result = db.prepare(`INSERT INTO users (phone, username, password_hash, role, verified, license_number, organisation, license_document, specialty, created_at)
    VALUES (?, ?, ?, 'professional', 0, ?, ?, ?, ?, ?)`)
    .run(phone, username, password_hash, license_number, organisation, license_document, specialty, new Date().toISOString());

  const user = db.prepare('SELECT id, phone, username, role, verified, licence_number, organisation, specialty FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.json({ token: signToken(user), user });
});

router.post('/login', async (req, res) => {
  const phone = String(req.body.phone || '').trim();
  const password = String(req.body.password || '').trim();
  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const profile = {
    id: user.id,
    phone: user.phone,
    username: user.username,
    role: user.role,
    verified: Boolean(user.verified),
    organisation: user.organisation,
    license_number: user.license_number,
    specialty: user.specialty
  };
  const activeAd = db.prepare('SELECT expires_at FROM ad_removal WHERE user_id = ?').get(user.id);
  profile.adRemovalExpiresAt = activeAd ? activeAd.expires_at : null;

  res.json({ token: signToken(profile), user: profile });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = db.prepare('SELECT id, phone, username, role, verified, organisation, license_number, specialty FROM users WHERE id = ?').get(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const activeAd = db.prepare('SELECT expires_at FROM ad_removal WHERE user_id = ?').get(user.id);
    res.json({ user: { ...user, verified: Boolean(user.verified), adRemovalExpiresAt: activeAd ? activeAd.expires_at : null } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
