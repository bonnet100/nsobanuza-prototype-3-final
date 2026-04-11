const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM posts ORDER BY is_sponsored DESC, created_at DESC');
    res.json({ posts: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
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

    const result = await query(
      `INSERT INTO posts (author_id, author_name, content, media_url, media_type, is_sponsored, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id`,
      [user.id, user.organisation || user.username, content, media_url, media_type, is_sponsored]
    );

    res.json({ postId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/boost', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'professional' || !user.verified) {
      return res.status(403).json({ error: 'Only verified professionals can boost posts.' });
    }

    const id = Number(req.params.id);
    const post = await query('SELECT id FROM posts WHERE id = $1 LIMIT 1', [id]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    await query('UPDATE posts SET is_sponsored = 1 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
