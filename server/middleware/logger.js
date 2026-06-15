
const OBJECT_ID = /^[a-f0-9]{24}$/i;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC = /^\d+$/;


const getBaseRoute = (originalUrl) => {
  const path = String(originalUrl || '').split('?')[0].split('#')[0];

  return path
    .split('/')
    .map((segment) => {
      if (!segment) return segment; 
      if (OBJECT_ID.test(segment)) return ':id';
      if (UUID.test(segment)) return ':id';
      if (NUMERIC.test(segment)) return ':id';
      return segment;
    })
    .join('/');
};

const SENSITIVE_PATTERNS = [
  'password',
  'passwd',
  'token',
  'secret',
  'apikey',
  'authorization',
  'creditcard',
  'cardnumber',
  'cvv',
  'cvc',
  'ssn',
  'privatekey',
  'clientsecret',
  'accesskey',
  'sessionid',
  'cookie',
];

const REDACTED = '[REDACTED]';

const MAX_DEPTH = 6;

const isSensitiveKey = (key) => {
  const normalized = String(key).toLowerCase().replace(/[_-]/g, '');
  return SENSITIVE_PATTERNS.some((pattern) => normalized.includes(pattern));
};

const redact = (value, depth = 0) => {
  if (depth >= MAX_DEPTH) return value;

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }

  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = isSensitiveKey(key) ? REDACTED : redact(val, depth + 1);
    }
    return out;
  }

  return value;
};

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
        const safeBody = redact(req.body);
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

logger.getBaseRoute = getBaseRoute;
logger.redact = redact;

module.exports = logger;
