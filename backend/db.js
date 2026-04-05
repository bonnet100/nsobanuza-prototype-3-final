const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDb() {
  try {
    // 1. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone TEXT UNIQUE,
        username TEXT,
        password_hash TEXT,
        role TEXT,
        verified INTEGER DEFAULT 0,
        license_number TEXT UNIQUE,
        organisation TEXT,
        license_document TEXT,
        specialty TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        author_id INTEGER,
        author_name TEXT,
        content TEXT,
        media_url TEXT,
        media_type TEXT,
        is_sponsored INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title TEXT,
        description TEXT,
        url TEXT,
        category TEXT,
        thumbnail TEXT,
        created_by TEXT
      );

      CREATE TABLE IF NOT EXISTS tracking_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        period_start_date DATE,
        mood TEXT,
        symptoms TEXT,
        logged_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Check if data exists, if not, seed it
    const userCheck = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.log("Seeding initial Nsobanuza data...");
      const hashedPass = await bcrypt.hash('Nsobanuza123!', 10);
      
      // Seed a test user
      await pool.query(
        `INSERT INTO users (phone, username, password_hash, role, created_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        ['+250781000001', 'amanzi', hashedPass, 'user']
      );

      // Seed a sample post for your new Instagram-style feed
      await pool.query(
        `INSERT INTO posts (author_name, content, media_url, media_type, created_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        ['Rwanda Biomedical Center', 'Menstrual hygiene is essential for health.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1', 'image']
      );
    }

    console.log('Successfully connected and initialized Neon Database');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb
};