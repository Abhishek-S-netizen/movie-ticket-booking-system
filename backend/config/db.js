const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // connectDB will pause until MONGODB_URI is provided in .env
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'your_mongodb_atlas_connection_string_here') {
      console.warn("MongoDB connection skipped. Please add your connection string to .env");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
