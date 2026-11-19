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
const MONGO_DB = process.env.MONGO_DB;

if (!MONGO_URI) {
    // Do not exit at import time: serverless platforms import this module per
    // invocation and should surface a normal error instead of a hard crash.
    console.error("MONGO_URI not set in server/.env");
}

mongoose.set("strictQuery", true);

let connectionPromise = null;

/**
 * Connect to MongoDB once per process. Safe to call on every request; the
 * connection is reused across warm serverless invocations.
 */
async function connectToDatabase() {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not set");
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (!connectionPromise) {
        // MONGO_URI may not include a database name (e.g. mongodb+srv://host/),
        // so honour MONGO_DB to avoid silently connecting to the default "test" DB.
        connectionPromise = mongoose
            .connect(MONGO_URI, MONGO_DB ? { dbName: MONGO_DB } : undefined)
            .then(() => {
                console.log("MongoDB connected successfully");
                return mongoose;
            })
            .catch((err) => {
                connectionPromise = null;
                throw err;
            });
    }

    return connectionPromise;
}

// Keep the default export as mongoose so existing `require("./db")` callers
// (for example seed scripts) continue to work.
module.exports = mongoose;
module.exports.connectToDatabase = connectToDatabase;
