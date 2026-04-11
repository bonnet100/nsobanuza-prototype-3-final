const jwt = require('jsonwebtoken');
const { query } = require('../db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const result = await query(
      `SELECT id, phone, username, role, verified, organisation, license_number, specialty, is_active
       FROM users
       WHERE id = $1`,
      [payload.id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    req.user = {
      ...user,
      verified: Boolean(user.verified),
      is_active: Boolean(user.is_active)
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  next();
};

module.exports = { authenticate, requireAdmin };
