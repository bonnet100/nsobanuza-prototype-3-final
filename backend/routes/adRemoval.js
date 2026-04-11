const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/watch', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await query(
      `INSERT INTO ad_removal (user_id, expires_at)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [userId, expiresAt]
    );

    res.json({ success: true, expires_at: expiresAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query('SELECT expires_at FROM ad_removal WHERE user_id = $1 LIMIT 1', [userId]);
    res.json({ expires_at: result.rows[0] ? result.rows[0].expires_at : null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
