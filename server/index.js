// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();
const port = process.env.PORT || 5000;
const allowedOrigin =
  process.env.ALLOWED_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173";
const allowedOrigins = allowedOrigin
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const isDev = process.env.NODE_ENV === "development";

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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many payment requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log("[CORS] Allowing request with no origin");
        return callback(null, true);
      }

      // In development, be more permissive
      if (
        (isDev && origin.includes("localhost")) ||
        origin.includes("127.0.0.1")
      ) {
        console.log(`[CORS] Allowing local development origin: ${origin}`);
        return callback(null, true);
      }

      // Check against allowed origins
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
app.use("/api/bugs", require("./routes/bugs"));

// ── // Razorpay / payment routes (prefixed with /api/payment) ─────────────────
// These handle:  POST /create-order
//                POST /verify-payment
//                POST /clear-cart
app.use("/api/payment", require("./routes/payment"));

// Nearby fitness centers
app.use("/api/fitness-centers", require("./routes/fitnessCenters"));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("FitMart server running"));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
});
