// server/middleware/logger.js

const MAX_BODY_LOG_LENGTH = 1000;

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /passcode/i,
  /pin/i,
  /otp/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /credential/i,
  /cookie/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /client[_-]?secret/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /razorpay[_-]?key[_-]?secret/i,
  /firebase[_-]?private[_-]?key/i,
];

const getTimestamp = () => new Date().toISOString();

const isSensitiveKey = (key = '') =>
  SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));

const sanitizeForLog = (value, seen = new WeakSet()) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item, seen));
  }

  return Object.entries(value).reduce((sanitized, [key, nestedValue]) => {
    sanitized[key] = isSensitiveKey(key)
      ? '[REDACTED]'
      : sanitizeForLog(nestedValue, seen);

    return sanitized;
  }, {});
};

// Function to get base route only and avoid logging query parameters
const getBaseRoute = (url) => {
  const pathname = url.split('?')[0];

  // Match patterns like /api/cart, /api/products, /api/orders
  const match = pathname.match(/^(\/api\/(?:cart|products|orders))/);
  if (match) {
    // If it's a cart route with additional path, append the action
    if (pathname.includes('/cart/') && !pathname.match(/^\/api\/cart\/?$/)) {
      if (pathname.includes('/add')) return '/api/cart/add';
      if (pathname.includes('/remove')) return '/api/cart/remove';
    }

    return match[1];
  }

  return pathname;
};

// Logger with timestamps and sensitive request body redaction
const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const simplifiedUrl = getBaseRoute(req.originalUrl);
    const timestamp = getTimestamp();

    const methodColor = {
      GET: '\x1b[34m',
      POST: '\x1b[32m',
      PUT: '\x1b[33m',
      DELETE: '\x1b[31m',
      PATCH: '\x1b[35m',
    }[req.method] || '\x1b[0m';

    const statusColor =
      status >= 500
        ? '\x1b[31m'
        : status >= 400
          ? '\x1b[33m'
          : status >= 300
            ? '\x1b[36m'
            : status >= 200
              ? '\x1b[32m'
              : '\x1b[0m';

    console.log(
      `[${timestamp}] ` +
        `${methodColor}${req.method.padEnd(6)}\x1b[0m ` +
        `${statusColor}${status}\x1b[0m ` +
        `${simplifiedUrl} (${duration}ms)`
    );

    if (req.method !== 'GET' && Object.keys(req.body || {}).length > 0) {
      try {
        const safeBody = sanitizeForLog(req.body);
        const bodyStr = JSON.stringify(safeBody);

        if (bodyStr.length < MAX_BODY_LOG_LENGTH) {
          console.log(`   [${getTimestamp()}] Body: ${bodyStr}`);
        } else {
          console.log(`   [${getTimestamp()}] Body: [too large to log: ${bodyStr.length} chars]`);
        }
      } catch (err) {
        console.log(`   [${getTimestamp()}] Body: [error parsing body]`);
      }
    }
  });

  next();
};

module.exports = logger;
