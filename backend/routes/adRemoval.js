const express = require('express');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/watch', authenticate, (req, res) => {
  const userId = req.user.id;
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const existing = db.prepare('SELECT id FROM ad_removal WHERE user_id = ?').get(userId);
  if (existing) {
    db.prepare('UPDATE ad_removal SET expires_at = ? WHERE user_id = ?').run(expires_at, userId);
  } else {
    db.prepare('INSERT INTO ad_removal (user_id, expires_at) VALUES (?, ?)').run(userId, expires_at);
  }
  res.json({ success: true, expires_at });
});

router.get('/status', authenticate, (req, res) => {
  const userId = req.user.id;
  const row = db.prepare('SELECT expires_at FROM ad_removal WHERE user_id = ?').get(userId);
  res.json({ expires_at: row ? row.expires_at : null });
});

module.exports = router;
