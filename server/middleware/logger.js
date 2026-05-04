// server/logger.js

const SENSITIVE_FIELDS = new Set([
  "token",
  "password",
  "secret",
  "authorization",
  "accessToken",
  "refreshToken",
  "apiKey",
  "api_key",
  "credential",
]);

/**
 * Recursively redact sensitive fields from objects/arrays
 */
function redactSensitiveFields(data) {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveFields);
  }

  if (typeof data === "object") {
    const redacted = {};

    for (const [key, value] of Object.entries(data)) {
      const keyLower = key.toLowerCase();

      if (SENSITIVE_FIELDS.has(key) || SENSITIVE_FIELDS.has(keyLower)) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactSensitiveFields(value);
      }
    }

    return redacted;
  }

  return data;
}

/**
 * Safe stringify to prevent crashes on circular JSON
 */
function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    return null;
  }
}

/**
 * Logger middleware
 */
function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const timestamp = new Date().toISOString();
    const duration = Date.now() - start;
    const status = res.statusCode;

    const prefix = `[${timestamp}] ${req.method} ${req.originalUrl} ${status} ${duration}ms`;

    // Always log basic request info
    console.log(prefix);

    // Only log body for non-GET requests
    if (req.method !== "GET" && req.body && Object.keys(req.body).length > 0) {
      try {
        const redactedBody = redactSensitiveFields(req.body);
        const bodyStr = safeStringify(redactedBody);

        if (!bodyStr) {
          console.log(`[${timestamp}] Body: [could not stringify body]`);
          return;
        }

        if (bodyStr.length < 1000) {
          console.log(`[${timestamp}] Body: ${bodyStr}`);
        } else {
          console.log(
            `[${timestamp}] Body: [body too large to log - ${bodyStr.length} chars]`
          );
        }
      } catch (err) {
        console.log(`[${timestamp}] Body: [error while logging body]`);
      }
    }
  });

  next();
}

module.exports = logger;