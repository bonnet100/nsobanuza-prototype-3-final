const express = require('express');
const { db } = require('../db');
const router = express.Router();

router.post('/verify-professional/:id', (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== (process.env.ADMIN_SECRET || 'supersecretadmin123')) {
    return res.status(403).json({ error: 'Invalid admin secret.' });
  }

  const id = Number(req.params.id);
  const professional = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?').get(id, 'professional');
  if (!professional) {
    return res.status(404).json({ error: 'Professional not found.' });
  }

  db.prepare('UPDATE users SET verified = 1 WHERE id = ?').run(id);
  res.json({ success: true, verified: true });
});

module.exports = router;
