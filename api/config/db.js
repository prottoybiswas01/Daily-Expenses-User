const mongoose = require('mongoose');

// Disable Mongoose buffering so operations fail fast if DB connection fails
mongoose.set('bufferCommands', false);

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://prottoyku001_db_user:B9QBOA6GHwAhHMah@cluster0.epbuseh.mongodb.net/daily_expenses_db?retryWrites=true&w=majority&appName=Cluster0';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    cachedConnection = conn;
    console.log(`[MongoDB] Connected successfully to ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw new Error(`Database connection failed: ${error.message}. Please check Network Access (0.0.0.0/0) in MongoDB Atlas Dashboard.`);
  }
};

module.exports = connectDB;
