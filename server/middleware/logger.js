// server/middleware/logger.js

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

// Simple logger with colors (without timestamps)
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
        const sensitiveKeys = ['password', 'token', 'secret', 'apiKey'];
        const safeBody = { ...req.body };

        sensitiveKeys.forEach((key) => {
          if (safeBody[key]) {
            safeBody[key] = '[REDACTED]';
          }
        });

        const bodyStr = JSON.stringify(safeBody);

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
