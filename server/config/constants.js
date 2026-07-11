const parseNonNegativeInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const CONSTANTS = {
  // Stock Thresholds
  LOW_STOCK_THRESHOLD: parseNonNegativeInteger(
    process.env.LOW_STOCK_THRESHOLD,
    5,
  ),

  // Server Config
  DEFAULT_PORT: 5000,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  API_LIMIT_MAX: 100, // Limit each IP to 100 requests per window
  PAYMENT_LIMIT_MAX: 20, // Stricter limit for payments
};

module.exports = CONSTANTS;