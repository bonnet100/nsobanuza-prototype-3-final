const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const phone = String(req.body.phone || '').trim();
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '').trim();

    if (!phone || !username || !password) {
      return res.status(400).json({ error: 'Phone, username, and password are required.' });
    }

    const existingPhone = await query('SELECT id FROM users WHERE phone = $1 LIMIT 1', [phone]);
    if (existingPhone.rows.length > 0) {
      return res.status(409).json({ error: 'Phone number already in use.' });
    }

    const existingUsername = await query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [username]
    );
    if (existingUsername.rows.length > 0) {
      return res.status(409).json({ error: 'Username already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (phone, username, password_hash, role, verified, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, phone, username, role, verified, is_active`,
      [phone, username, passwordHash, 'user', 0, true]
    );

    const user = result.rows[0];
    res.json({
      success: true,
      message: 'Registration successful. You can now log in with your username and password.',
      user: { ...user, verified: Boolean(user.verified), is_active: Boolean(user.is_active) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register-professional', async (req, res) => {
  try {
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

    const phoneExists = await query('SELECT id FROM users WHERE phone = $1 LIMIT 1', [phone]);
    if (phoneExists.rows.length > 0) {
      return res.status(409).json({ error: 'Phone number already in use.' });
    }

    const usernameExists = await query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [username]
    );
    if (usernameExists.rows.length > 0) {
      return res.status(409).json({ error: 'Username already in use.' });
    }

    const licenseExists = await query('SELECT id FROM users WHERE license_number = $1 LIMIT 1', [license_number]);
    if (licenseExists.rows.length > 0) {
      return res.status(409).json({ error: 'License number already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (
         phone, username, password_hash, role, verified, is_active,
         license_number, organisation, license_document, specialty, created_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING id, phone, username, role, verified, is_active, license_number, organisation, specialty`,
      [phone, username, passwordHash, 'professional', 0, true, license_number, organisation, license_document, specialty]
    );

    const user = result.rows[0];
    res.json({
      success: true,
      message: 'Professional registration successful. You can now log in with your username and password.',
      user: { ...user, verified: Boolean(user.verified), is_active: Boolean(user.is_active) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '').trim();

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const result = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1', [username]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account suspended.' });
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
      specialty: user.specialty,
      is_active: Boolean(user.is_active)
    };

    const activeAd = await query('SELECT expires_at FROM ad_removal WHERE user_id = $1 LIMIT 1', [user.id]);
    profile.adRemovalExpiresAt = activeAd.rows[0] ? activeAd.rows[0].expires_at : null;

    res.json({ token: signToken(profile), user: profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const result = await query(
      `SELECT id, phone, username, role, verified, organisation, license_number, specialty, is_active
       FROM users
       WHERE id = $1`,
      [payload.id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    const activeAd = await query('SELECT expires_at FROM ad_removal WHERE user_id = $1 LIMIT 1', [user.id]);
    res.json({
      user: {
        ...user,
        verified: Boolean(user.verified),
        is_active: Boolean(user.is_active),
        adRemovalExpiresAt: activeAd.rows[0] ? activeAd.rows[0].expires_at : null
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
