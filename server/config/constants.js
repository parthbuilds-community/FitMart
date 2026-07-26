// server/config/constants.js

function intEnv(name, fallback) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === "") return fallback;
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : fallback;
}

const CONSTANTS = {
  // Stock Thresholds — override with LOW_STOCK_THRESHOLD in server/.env
  LOW_STOCK_THRESHOLD: intEnv("LOW_STOCK_THRESHOLD", 5),

  // Server Config
  DEFAULT_PORT: 5000,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  API_LIMIT_MAX: 100, // Limit each IP to 100 requests per window
  PAYMENT_LIMIT_MAX: 20, // Stricter limit for payments
};

module.exports = CONSTANTS;
