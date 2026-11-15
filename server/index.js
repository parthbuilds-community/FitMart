// server/index.js
// Process entry point. Side effects (env validation, database connection,
// development seeding, listener) live here; the Express app itself is built by
// the typed factory in app.ts so tests can import it without side effects.
require("dotenv").config();

const { DEFAULT_PORT } = require("./config/constants");
const { createApp, allowedOrigins } = require("./app.ts");

const port = process.env.PORT || DEFAULT_PORT;

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
  process.exit(1);
}

if (missingOptional.length > 0) {
  console.warn(
    `⚠️ Missing optional environment variables: ${missingOptional.join(", ")}`,
  );
  console.warn(
    "Continuing startup; some optional functionality may be disabled.",
  );
}

// ── Database ────────────────────────────────────────────────────────────────
require("./db");

// ── Development: seed a local admin profile if configured ──────────────────
if (process.env.NODE_ENV !== 'production') {
  try {
    const UserProfile = require('./models/UserProfile');
    const devEmail = process.env.DEV_ADMIN_EMAIL;
    const devUid = process.env.DEV_ADMIN_UID;
    if (devEmail || devUid) {
      const query = devUid ? { userId: devUid } : { email: devEmail };
      UserProfile.findOne(query).then((u) => {
        if (!u && devUid) {
          const up = new UserProfile({ userId: devUid, email: devEmail, name: 'Dev Admin' });
          up.save().then(() => console.log('Seeded dev admin user profile')).catch(() => { });
        }
      }).catch(() => { });
    }
  } catch (err) {
    console.warn('Dev seeding skipped:', err.message);
  }
}

const app = createApp();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
});
