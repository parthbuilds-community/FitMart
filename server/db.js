const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB;

if (!MONGO_URI) {
  console.error('MONGO_URI not set in server/.env');
  process.exit(1);
}

mongoose.set('strictQuery', true);

async function connect() {
  try {
    await mongoose.connect(MONGO_URI, MONGO_DB ? { dbName: MONGO_DB } : {});
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

connect();

module.exports = mongoose;
