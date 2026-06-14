// Keeps logs clean by showing only the main API route
const getBaseRoute = (url) => {
  const pathname = url.split('?')[0];

  if (/^\/api\/cart\/add\/?$/.test(pathname)) {
    return '/api/cart/add';
  }

  if (/^\/api\/cart\/remove\/?$/.test(pathname)) {
    return '/api/cart/remove';
  }

  const match = pathname.match(/^\/api\/[^/]+/);

  return match ? match[0] : pathname;
};

// Hides sensitive values before they reach the logs
const redactSensitiveData = (obj) => {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apikey',
    'apiKey',
    'accessToken',
    'refreshToken',
  ];

  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const result = {};

  for (const key of Object.keys(obj)) {
    if (
      sensitiveKeys.some(
        (sensitiveKey) =>
          sensitiveKey.toLowerCase() === key.toLowerCase()
      )
    ) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redactSensitiveData(obj[key]);
    }
  }

  return result;
};

// Logs request details once the response is finished
const logger = (req, res, next) => {
  const start = Date.now();

  // Save a safe copy of the request body early
  const requestBody = req.body
    ? redactSensitiveData(req.body)
    : null;

  const logRequest = () => {
    // Prevent duplicate logs from finish + close events
    if (res.__logged) return;
    res.__logged = true;

    const duration = Date.now() - start;
    const status = res.statusCode;
    const route = getBaseRoute(req.originalUrl);
    const timestamp = new Date().toISOString();

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
      `${route} (${duration}ms)`
    );

    // Log request body for non-GET requests
    if (
      req.method !== 'GET' &&
      requestBody &&
      Object.keys(requestBody).length > 0
    ) {
      try {
        const bodyStr = JSON.stringify(requestBody);

        console.log(
          bodyStr.length < 1000
            ? `   Body: ${bodyStr}`
            : '   Body: [too large to log]'
        );
      } catch {
        console.log('   Body: [unable to serialize]');
      }
    }
  };

  // Handle both normal and interrupted requests
  res.on('finish', logRequest);
  res.on('close', logRequest);

  next();
};

module.exports = logger;