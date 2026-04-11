const express = require('express');
const { query } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/overview', async (req, res) => {
  try {
    const [usersResult, pendingProfessionalsResult, activeUsersResult] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM users'),
      query(`SELECT COUNT(*)::int AS count FROM users WHERE role = $1 AND verified = $2`, ['professional', 0]),
      query('SELECT COUNT(*)::int AS count FROM users WHERE is_active = TRUE')
    ]);

    res.json({
      overview: {
        totalUsers: usersResult.rows[0].count,
        pendingProfessionals: pendingProfessionalsResult.rows[0].count,
        activeUsers: activeUsersResult.rows[0].count
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const role = String(req.query.role || '').trim();
    const status = String(req.query.status || '').trim();
    const params = [];
    const filters = [];

    if (role) {
      params.push(role);
      filters.push(`role = $${params.length}`);
    }

    if (status === 'active') {
      filters.push('is_active = TRUE');
    } else if (status === 'suspended') {
      filters.push('is_active = FALSE');
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const result = await query(
      `SELECT id, phone, username, role, verified, organisation, license_number, specialty, is_active, created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    res.json({
      users: result.rows.map((user) => ({
        ...user,
        verified: Boolean(user.verified),
        is_active: Boolean(user.is_active)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/professionals/pending', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, username, phone, organisation, license_number, specialty, created_at
       FROM users
       WHERE role = $1 AND verified = $2
       ORDER BY created_at DESC`,
      ['professional', 0]
    );

    res.json({ professionals: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/professionals/:id/verify', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid professional id.' });
    }

    const result = await query(
      `UPDATE users
       SET verified = 1
       WHERE id = $1 AND role = $2
       RETURNING id, username, role, verified, organisation, specialty`,
      [id, 'professional']
    );

    const professional = result.rows[0];
    if (!professional) {
      return res.status(404).json({ error: 'Professional not found.' });
    }

    res.json({ success: true, professional: { ...professional, verified: Boolean(professional.verified) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const isActive = Boolean(req.body.is_active);

    if (!id) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Admins cannot change their own status.' });
    }

    const result = await query(
      `UPDATE users
       SET is_active = $1
       WHERE id = $2
       RETURNING id, username, role, verified, is_active`,
      [isActive, id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        ...user,
        verified: Boolean(user.verified),
        is_active: Boolean(user.is_active)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
