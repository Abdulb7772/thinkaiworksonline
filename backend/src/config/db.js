const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

let isConnected = false;

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    isConnected = true;
    console.log('✓ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    isConnected = false;
    console.log('⚠ Server will start without database. Auth and data queries require MongoDB.');
    return null;
  }
};

const isDBConnected = () => isConnected;

const closeDatabase = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB connection closed');
  }
};

module.exports = { connectDB, closeDatabase, isDBConnected };
