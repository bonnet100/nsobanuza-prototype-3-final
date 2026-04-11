const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function diffDays(laterDate, earlierDate) {
  return Math.round((laterDate.getTime() - earlierDate.getTime()) / MS_PER_DAY);
}

router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const period_start_date = String(req.body.period_start_date || '').trim();
    const mood = String(req.body.mood || '').trim();
    const symptoms = String(req.body.symptoms || '').trim();

    if (!period_start_date) {
      return res.status(400).json({ error: 'Period start date is required.' });
    }

    if (!parseIsoDate(period_start_date)) {
      return res.status(400).json({ error: 'Period start date must be a valid YYYY-MM-DD date.' });
    }

    await query(
      `INSERT INTO tracking_logs (user_id, period_start_date, mood, symptoms, logged_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, period_start_date, mood, symptoms]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/predict', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const logs = await query(
      `SELECT period_start_date
       FROM tracking_logs
       WHERE user_id = $1
       ORDER BY period_start_date DESC, logged_at DESC
       LIMIT 3`,
      [userId]
    );

    const dates = logs.rows
      .map((row) => parseIsoDate(String(row.period_start_date).slice(0, 10)))
      .filter(Boolean);

    if (!dates.length) {
      return res.json({ prediction: null, message: 'Log at least one period start date to get predictions.' });
    }

    const cycleLengths = [];
    for (let index = 0; index < dates.length - 1; index += 1) {
      const cycleLength = diffDays(dates[index], dates[index + 1]);
      if (cycleLength > 0) {
        cycleLengths.push(cycleLength);
      }
    }

    const averageCycle = cycleLengths.length
      ? Math.round(cycleLengths.reduce((sum, cycleLength) => sum + cycleLength, 0) / cycleLengths.length)
      : 28;

    const predictedDate = addDays(dates[0], averageCycle);
    res.json({ prediction: formatIsoDate(predictedDate), cycleLength: averageCycle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId', authenticate, async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const result = await query(
      `SELECT *
       FROM tracking_logs
       WHERE user_id = $1
       ORDER BY period_start_date DESC, logged_at DESC`,
      [userId]
    );

    res.json({ logs: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
