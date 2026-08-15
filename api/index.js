const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Ensure DB Connection on every Vercel request lifecycle
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Connection Error]:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection error. Please ensure MongoDB Atlas Network Access is set to Allow Access From Anywhere (0.0.0.0/0).'
    });
  }
});

// Register API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/wallets', require('./routes/walletRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));
app.use('/api/guardian', require('./routes/guardianRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Daily Expenses & Student Budget Tracker API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Global API Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Standalone Node server start (if executed directly)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Express Server] Listening on port ${PORT}`);
  });
}

// Export for Vercel Serverless Function environment
module.exports = app;
