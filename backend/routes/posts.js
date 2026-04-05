const express = require('express');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY is_sponsored DESC, created_at DESC').all();
  res.json({ posts });
});

router.post('/', authenticate, (req, res) => {
  const user = req.user;
  if (user.role !== 'professional' || !user.verified) {
    return res.status(403).json({ error: 'Only verified professionals can create posts.' });
  }

  const content = String(req.body.content || '').trim();
  const media_url = String(req.body.media_url || '').trim();
  const media_type = String(req.body.media_type || 'image').trim();
  const is_sponsored = req.body.is_sponsored ? 1 : 0;

  if (!content) {
    return res.status(400).json({ error: 'Post content is required.' });
  }

  const stmt = db.prepare(`INSERT INTO posts (author_id, author_name, content, media_url, media_type, is_sponsored, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const result = stmt.run(user.id, user.organisation || user.username, content, media_url, media_type, is_sponsored, new Date().toISOString());
  res.json({ postId: result.lastInsertRowid });
});

router.put('/:id/boost', authenticate, (req, res) => {
  const user = req.user;
  if (user.role !== 'professional' || !user.verified) {
    return res.status(403).json({ error: 'Only verified professionals can boost posts.' });
  }

  const id = Number(req.params.id);
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  db.prepare('UPDATE posts SET is_sponsored = 1 WHERE id = ?').run(id);
  res.json({ success: true });
});

module.exports = router;
