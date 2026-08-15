const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://prottoyku001_db_user:B9QBOA6GHwAhHMah@cluster0.epbuseh.mongodb.net/daily_expenses_db?retryWrites=true&w=majority&appName=Cluster0';

    const opts = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected to ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch(err => {
      cached.promise = null;
      console.error(`[MongoDB] Connection error: ${err.message}`);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
