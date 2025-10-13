const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || typeof process.env.MONGO_URI !== 'string' || !process.env.MONGO_URI.trim()) {
      throw new Error('MONGO_URI is not set. Define it in server/.env');
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;