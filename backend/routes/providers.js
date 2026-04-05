const express = require('express');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const specialty = String(req.query.specialty || '').trim();
  let providers;
  if (specialty) {
    providers = db.prepare('SELECT id, username, organisation, license_number, specialty FROM users WHERE role = ? AND verified = 1 AND specialty = ?').all('professional', specialty);
  } else {
    providers = db.prepare('SELECT id, username, organisation, license_number, specialty FROM users WHERE role = ? AND verified = 1').all('professional');
  }
  res.json({ providers });
});

router.post('/consultations/request', authenticate, (req, res) => {
  const userId = req.user.id;
  const professionalId = Number(req.body.professionalId);
  const message = String(req.body.message || '').trim();

  if (!professionalId || !message) {
    return res.status(400).json({ error: 'Professional and message are required.' });
  }

  const professional = db.prepare('SELECT id FROM users WHERE id = ? AND role = ? AND verified = 1').get(professionalId, 'professional');
  if (!professional) {
    return res.status(404).json({ error: 'Professional not found.' });
  }

  const encrypted_message = Buffer.from(message, 'utf-8').toString('base64');
  db.prepare(`INSERT INTO consultations (user_id, professional_id, status, encrypted_message, created_at)
    VALUES (?, ?, 'pending', ?, ?)`)
    .run(userId, professionalId, encrypted_message, new Date().toISOString());

  res.json({ success: true });
});

module.exports = router;
