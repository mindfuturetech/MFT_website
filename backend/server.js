// =============================================
// Mindfuturetech Backend Server
// =============================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const formRoute = require('./routes/form');

const app = express();

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Request logger ----
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---- Health check ----
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mindfuturetech backend is running' });
});

// ---- Routes ----
app.use('/api', formRoute);       // POST /api/submit

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ---- Start server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});