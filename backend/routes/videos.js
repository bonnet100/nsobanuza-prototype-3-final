const express = require('express');
const { query } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM videos ORDER BY id DESC');
    res.json({ videos: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await query('SELECT * FROM videos WHERE id = $1 LIMIT 1', [id]);
    const video = result.rows[0];

    if (!video) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    res.json({ video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
