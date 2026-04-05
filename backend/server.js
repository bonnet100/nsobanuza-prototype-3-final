const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const videosRoutes = require('./routes/videos');
const chatRoutes = require('./routes/chat');
const trackingRoutes = require('./routes/tracking');
const providersRoutes = require('./routes/providers');
const adminRoutes = require('./routes/admin');
const adRemovalRoutes = require('./routes/adRemoval');
const { initDb } = require('./db');

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

initDb();

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ad-removal', adRemovalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Nsobanuza backend is running' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(port, () => {
  console.log(`Nsobanuza backend listening on http://localhost:${port}`);
});
