const SENSITIVE_FIELDS = new Set([
  "token",
  "password",
  "secret",
  "authorization",
  "accessToken",
  "refreshToken",
]);

function redactSensitiveFields(data) {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveFields);
  }

  if (typeof data === "object") {
    const redacted = {};

    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.has(key)) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactSensitiveFields(value);
      }
    }

    return redacted;
  }

  return data;
}

function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] ${req.method} ${req.url}`;

  if (req.method !== "GET") {
    try {
      const safeBody = redactSensitiveFields(req.body);
      const bodyStr = JSON.stringify(safeBody);

      if (bodyStr.length < 1000) {
        console.log(prefix, safeBody);
      } else {
        console.log(`${prefix} [body too large to log]`);
      }
    } catch (err) {
      console.log(`${prefix} [body could not be logged]`);
    }
  } else {
    console.log(prefix);
  }

  next();
}

module.exports = logger;