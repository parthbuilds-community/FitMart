const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('./lib/logger');

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB;

if (!MONGO_URI) {
  logger.error('MONGO_URI not set in server/.env');
  process.exit(1);
}

mongoose.set('strictQuery', true);

async function connect() {
  try {
    await mongoose.connect(MONGO_URI, MONGO_DB ? { dbName: MONGO_DB } : {});
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

connect();

module.exports = mongoose;
