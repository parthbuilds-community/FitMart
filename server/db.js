const dns = require("node:dns");

// Optional workaround for environments where Node incorrectly resolves
// DNS servers (e.g. localhost/127.0.0.1), causing MongoDB Atlas SRV
// lookups to fail with `querySrv ECONNREFUSED`.
//
// Example:
//   DNS_SERVERS=8.8.8.8,8.8.4.4
//
if (process.env.DNS_SERVERS) {
    const servers = process.env.DNS_SERVERS
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

    if (servers.length > 0) {
        dns.setServers(servers);
        console.log(`[dns] Using custom DNS servers: ${servers.join(", ")}`);
    }
}

const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI not set in server/.env");
    process.exit(1);
}

mongoose.set("strictQuery", true);

async function connect() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    }
}

connect();

module.exports = mongoose;