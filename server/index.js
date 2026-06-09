// server/index.js
require("dotenv").config();
const rewardsRoutes = require("./routes/rewards");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { RATE_LIMIT_WINDOW_MS, API_LIMIT_MAX, PAYMENT_LIMIT_MAX, DEFAULT_PORT } = require("./config/constants");
const app = express();
const port = process.env.PORT || DEFAULT_PORT;
const allowedOrigin = process.env.ALLOWED_ORIGIN || "";
const allowedOrigins = allowedOrigin
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== "production";
const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === "true" || isDev;



if (isDev) {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

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

// ── Middleware ──────────────────────────────────────────────────────────────

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: API_LIMIT_MAX,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: PAYMENT_LIMIT_MAX,
  message: { error: "Too many payment requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowAllOrigins) {
        console.log(`[CORS] Allowing all origins for testing`);
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log(`[CORS] Allowing whitelisted origin: ${origin}`);
        return callback(null, true);
      }

      console.error(
        `[CORS] Rejecting origin: ${origin}. Allowed origins: ${allowedOrigins.join(", ")}`,
      );
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Disable automatic ETag generation to avoid conditional 304 responses
app.disable("etag");

// Ensure API responses are not served from client caches (avoid 304 from conditional requests)
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use("/api", apiLimiter);
app.use("/api/payment/create-order", paymentLimiter);
app.use("/api/payment/verify-payment", paymentLimiter);

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

// ── Logger (after body parsing, before routes) ──────────────────────────────
const logger = require("./middleware/logger");
app.use(logger);
//Dashboard route needs logger to parse query params for logging

const dashboardRoutes = require("./routes/dashboard");

// ── API routes (prefixed) ───────────────────────────────────────────────────
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", require("./routes/reports"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/user", require("./routes/user"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/exercises", require("./routes/exercises"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/bugs", require("./routes/bugs"));

// ── // Razorpay / payment routes (prefixed with /api/payment) ─────────────────
// These handle:  POST /create-order
//                POST /verify-payment
//                POST /clear-cart
app.use("/api/payment", require("./routes/payment"));
// FitRewards loyalty points routes
app.use("/api/rewards", require("./routes/rewards"));

// Nearby fitness centers
app.use("/api/fitness-centers", require("./routes/fitnessCenters"));

// Development-only auth helpers
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/dev', require('./routes/devAuth'));
}

// Proxy GitHub stats to avoid client-side rate limits and CORS errors
app.use("/api/github", require("./routes/github"));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("FitMart server running"));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ error: "Payload too large" });
  }

  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
});
