// server/middleware/logger.js

// Function to get base route only
const getBaseRoute = (url) => {
  // Match patterns like /api/cart, /api/products, /api/orders
  const match = url.match(/^(\/api\/(?:cart|products|orders))/);
  if (match) {
    // If it's a cart route with additional path, append the action
    if (url.includes('/cart/') && !url.match(/^\/api\/cart\/?$/)) {
      if (url.includes('/add')) return '/api/cart/add';
      if (url.includes('/remove')) return '/api/cart/remove';
    }
    return match[1];
  }
  return url;
};

const sensitiveKeyPattern = /(password|token|secret|apikey|api_key|authorization|credential)/i;

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === '[object Object]';

const redactSensitiveFields = (value, seen = new WeakSet()) => {
  if (Array.isArray(value)) return value.map((item) => redactSensitiveFields(item, seen));
  if (!value || typeof value !== 'object') return value;
  if (!isPlainObject(value)) return value;
  if (seen.has(value)) return '[Circular]';

  seen.add(value);

  const redacted = Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      sensitiveKeyPattern.test(key) ? '[REDACTED]' : redactSensitiveFields(nestedValue, seen),
    ])
  );

  seen.delete(value);

  return redacted;
};

// Simple logger with colors, timestamps, body size guards, and sensitive-field redaction
const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const simplifiedUrl = getBaseRoute(req.originalUrl);
    const timestamp = new Date().toISOString();

    const methodColor = {
      'GET': '\x1b[34m',
      'POST': '\x1b[32m',
      'PUT': '\x1b[33m',
      'DELETE': '\x1b[31m',
      'PATCH': '\x1b[35m',
    }[req.method] || '\x1b[0m';

    const statusColor = status >= 500 ? '\x1b[31m' :
      status >= 400 ? '\x1b[33m' :
        status >= 300 ? '\x1b[36m' :
          status >= 200 ? '\x1b[32m' :
            '\x1b[0m';

    console.log(
      `[${timestamp}] ` +
      `${methodColor}${req.method.padEnd(6)}\x1b[0m ` +
      `${statusColor}${status}\x1b[0m ` +
      `${simplifiedUrl} (${duration}ms)`
    );

    if (req.method !== 'GET' && Object.keys(req.body || {}).length > 0) {
      try {
        const bodyStr = JSON.stringify(redactSensitiveFields(req.body));

        if (bodyStr.length < 1000) {
          console.log(`   Body: ${bodyStr}`);
        } else {
          console.log(`   Body: [too large to log]`);
        }
      } catch (err) {
        console.log(`   Body: [error parsing body]`);
      }
    }
  });

  next();
};

module.exports = logger;
