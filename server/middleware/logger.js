// server/middleware/logger.js

  const SENSITIVE_FIELDS = ['token', 'password', 'secret', 'apiKey', 'api_key', 'authorization', 'credential'];

  // Function to recursively redact sensitive fields
  const redactSensitiveFields = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key of Object.keys(redacted)) {
      const keyLower = key.toLowerCase();
      if (SENSITIVE_FIELDS.some(field => keyLower.includes(field.toLowerCase()))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = redactSensitiveFields(redacted[key]);
      }
    }

    return redacted;
  };

  // Function to get base route only
  const getBaseRoute = (url) => {
    const match = url.match(/^(\/api\/(?:cart|products|orders))/);
    if (match) {
      if (url.includes('/cart/') && !url.match(/^\/api\/cart\/?$/)) {
        if (url.includes('/add')) return '/api/cart/add';
        if (url.includes('/remove')) return '/api/cart/remove';
      }
      return match[1];
    }
    return url;
  };

  // Simple logger with timestamps, size guard, and sensitive field redaction
  const logger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const timestamp = new Date().toISOString();

      const simplifiedUrl = getBaseRoute(req.originalUrl);

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
        `${methodColor}${req.method.padEnd(6)}\x1b[0m ` +
        `${statusColor}${status}\x1b[0m ` +
        `${simplifiedUrl}`
      );

      // Log request body for non-GET requests with size guard and redaction
      if (req.method !== 'GET' && Object.keys(req.body || {}).length > 0) {
        const bodyStr = JSON.stringify(req.body);
        if (bodyStr.length < 1000) {
          const redactedBody = redactSensitiveFields(req.body);
          console.log(`[${timestamp}] Body: ${JSON.stringify(redactedBody)}`);
        } else {
          console.log(`[${timestamp}] Body: [body too large to log - ${bodyStr.length} chars]`);
        }
      }
    });

    next();
  };

  module.exports = logger;