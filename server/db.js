const mongoose = require('mongoose');
require('dotenv').config();

let MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB || 'FitMart';

mongoose.set('strictQuery', true);

async function connect() {
  try {
    if (!MONGO_URI) {
      console.log('No MONGO_URI found, spinning up mongodb-memory-server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      MONGO_URI = mongoServer.getUri();
    }
    await mongoose.connect(MONGO_URI, MONGO_DB ? { dbName: MONGO_DB } : {});
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

connect();

module.exports = mongoose;
