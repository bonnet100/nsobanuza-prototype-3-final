const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const specialty = String(req.query.specialty || '').trim();
    let result;

    if (specialty) {
      result = await query(
        `SELECT id, username, organisation, license_number, specialty
         FROM users
         WHERE role = $1 AND verified = $2 AND specialty = $3
         ORDER BY created_at DESC`,
        ['professional', 1, specialty]
      );
    } else {
      result = await query(
        `SELECT id, username, organisation, license_number, specialty
         FROM users
         WHERE role = $1 AND verified = $2
         ORDER BY created_at DESC`,
        ['professional', 1]
      );
    }

    res.json({ providers: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/consultations/request', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const professionalId = Number(req.body.professionalId);
    const message = String(req.body.message || '').trim();

    if (!professionalId || !message) {
      return res.status(400).json({ error: 'Professional and message are required.' });
    }

    const professional = await query(
      'SELECT id FROM users WHERE id = $1 AND role = $2 AND verified = $3 LIMIT 1',
      [professionalId, 'professional', 1]
    );
    if (professional.rows.length === 0) {
      return res.status(404).json({ error: 'Professional not found.' });
    }

    const encryptedMessage = Buffer.from(message, 'utf-8').toString('base64');
    await query(
      `INSERT INTO consultations (user_id, professional_id, status, encrypted_message, created_at)
       VALUES ($1, $2, 'pending', $3, NOW())`,
      [userId, professionalId, encryptedMessage]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
