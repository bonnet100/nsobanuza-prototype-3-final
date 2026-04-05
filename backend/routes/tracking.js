const express = require('express');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/:userId', authenticate, (req, res) => {
  const userId = Number(req.params.userId);
  if (userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const logs = db.prepare('SELECT * FROM tracking_logs WHERE user_id = ? ORDER BY logged_at DESC').all(userId);
  res.json({ logs });
});

router.post('/', authenticate, (req, res) => {
  const userId = req.user.id;
  const period_start_date = String(req.body.period_start_date || '').trim();
  const mood = String(req.body.mood || '').trim();
  const symptoms = String(req.body.symptoms || '').trim();

  if (!period_start_date) {
    return res.status(400).json({ error: 'Period start date is required.' });
  }

  db.prepare(`INSERT INTO tracking_logs (user_id, period_start_date, mood, symptoms, logged_at)
    VALUES (?, ?, ?, ?, ?)`)
    .run(userId, period_start_date, mood, symptoms, new Date().toISOString());

  res.json({ success: true });
});

router.get('/predict', authenticate, (req, res) => {
  const userId = req.user.id;
  const logs = db.prepare('SELECT period_start_date FROM tracking_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 3').all(userId);
  const dates = logs.map((row) => new Date(row.period_start_date));

  if (!dates.length) {
    return res.json({ prediction: null, message: 'Log at least one period start date to get predictions.' });
  }

  const averageCycle = dates.length > 1 ? dates.reduce((sum, date, idx) => {
    if (idx === 0) return 0;
    return sum + (dates[idx - 1] - date) / (1000 * 60 * 60 * 24);
  }, 0) / (dates.length - 1) : 28;

  const lastDate = dates[0];
  const predict = new Date(lastDate.getTime() + Math.round(averageCycle || 28) * 24 * 60 * 60 * 1000);
  res.json({ prediction: predict.toISOString().split('T')[0], cycleLength: Math.round(averageCycle || 28) });
});

module.exports = router;
