const express = require('express');
const { db } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const videos = db.prepare('SELECT * FROM videos ORDER BY id DESC').all();
  res.json({ videos });
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
  if (!video) {
    return res.status(404).json({ error: 'Video not found.' });
  }
  res.json({ video });
});

module.exports = router;
