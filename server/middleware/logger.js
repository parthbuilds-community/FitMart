const SENSITIVE_FIELDS = [
  "token",
  "password",
  "secret",
  "authorization",
  "accessToken",
  "refreshToken",
];

// Recursive function to redact sensitive fields
function redactSensitiveFields(data) {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveFields);
  }

  if (typeof data === "object") {
    const redacted = {};

    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.includes(key)) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactSensitiveFields(value);
      }
    }

    return redacted;
  }

  return data;
}

// Logger middleware
function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] ${req.method} ${req.url}`;

  // Log GET requests (no body)
  if (req.method === "GET") {
    console.log(prefix);
    return next();
  }

  try {
    const safeBody = redactSensitiveFields(req.body || {});
    const bodyStr = JSON.stringify(safeBody);

    // Size guard
    if (bodyStr.length < 1000) {
      console.log(prefix, safeBody);
    } else {
      console.log(`${prefix} [body too large to log]`);
    }
  } catch (error) {
    console.log(`${prefix} [body could not be logged safely]`);
  }

  next();
}

module.exports = logger;