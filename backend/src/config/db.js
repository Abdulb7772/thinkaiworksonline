const mongoose = require('mongoose');
const dns = require('dns');

let isConnected = false;

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    isConnected = true;
    console.log('✓ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED' || /querySrv.*ECONNREFUSED/.test(error.message)) {
      console.log('⚠ Local DNS cannot resolve Atlas SRV — retrying with Google DNS...');
      dns.setServers(['8.8.8.8', '8.8.4.4']);
      try {
        await mongoose.connect(uri, {
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferCommands: false,
        });
        isConnected = true;
        console.log('✓ MongoDB connected successfully (via Google DNS)');
        return mongoose.connection;
      } catch (retryError) {
        console.error('✗ MongoDB connection (retry) failed:', retryError.message);
      }
    } else {
      console.error('✗ MongoDB connection failed:', error.message);
    }

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
