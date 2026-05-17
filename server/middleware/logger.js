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

  const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apikey', 'authorization'];

  const redactDeep = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(redactDeep);
    }

    const result = {};
    for (const key in obj) {
      if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = redactDeep(obj[key]);
      }
    }
    return result;
  };

  const safeStringify = (obj) => {
    try {
      return JSON.stringify(obj);
    } catch (err) {
      return null;
    }
  };

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

    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = redactDeep(req.body);
      const bodyStr = safeStringify(sanitizedBody);

      if (!bodyStr) {
        console.log(`[${timestamp}]    Body: [unserializable body]`);
        return;
      }

      if (bodyStr.length < 1000) {
        console.log(`[${timestamp}]    Body: ${bodyStr}`);
      } else {
        console.log(`[${timestamp}]    Body: [body too large to log]`);
      }
    }
  });

  next();
};

module.exports = logger;
  });

  next();
};

module.exports = logger;
