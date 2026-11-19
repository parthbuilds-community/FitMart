// server/index.js
// Process entry point. Side effects (env validation, database connection,
// listener) live here; the Express app itself is built by the typed factory in
// app.ts so tests can import it without side effects.
require("dotenv").config();

// app.ts is TypeScript. tsx registers a require hook so plain `node index.js`
// also works (for example when the file is used as a Vercel function entry).
require("tsx/cjs");

const { DEFAULT_PORT } = require("./config/constants");
const { createApp, allowedOrigins } = require("./app.ts");
const { connectToDatabase } = require("./db");

const port = process.env.PORT || DEFAULT_PORT;
const isServerless = Boolean(process.env.VERCEL);

// Display missing variables at server startup. Only require truly critical vars
// to avoid failing entirely in environments where optional services (Razorpay)
// are intentionally not configured (for example: demo deployments on Vercel).
const CRITICAL_ENV_VARS = ["MONGO_URI"];
const OPTIONAL_ENV_VARS = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "MONGO_DB",
  "PORT",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
];

const missingCritical = CRITICAL_ENV_VARS.filter((v) => !process.env[v]);
const missingOptional = OPTIONAL_ENV_VARS.filter((v) => !process.env[v]);

if (missingCritical.length > 0) {
  console.error(
    `❌ Missing critical environment variables: ${missingCritical.join(", ")}`,
  );
  console.error(
    "Server cannot start without these. Please set them in your environment.",
  );
  // Serverless platforms should return a response instead of killing the
  // whole function process, so only exit for a normal long-running server.
  if (!isServerless) process.exit(1);
}

if (missingOptional.length > 0) {
  console.warn(
    `⚠️ Missing optional environment variables: ${missingOptional.join(", ")}`,
  );
  console.warn(
    "Continuing startup; some optional functionality may be disabled.",
  );
}

const app = createApp();

if (isServerless) {
  // Vercel expects an exported request handler. Reuse one database connection
  // across warm invocations.
  let connectionPromise = null;

  module.exports = async function handler(req, res) {
    try {
      if (!connectionPromise) connectionPromise = connectToDatabase();
      await connectionPromise;
    } catch (err) {
      console.error("Database connection failed:", err.message);
      if (!res.headersSent) {
        // The Express CORS middleware has not run yet, so mirror its headers
        // for this early error response.
        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin);
          res.setHeader("Access-Control-Allow-Credentials", "true");
          res.setHeader("Vary", "Origin");
        }
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Database unavailable" }));
      }
      return;
    }

    return app(req, res);
  };
} else {
  connectToDatabase().catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
  });
}
