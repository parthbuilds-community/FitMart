// server/lib/logger.js
// Structured logger for consistent, leveled application logging.
// Use these methods instead of ad-hoc console.log/warn/error calls.
//
// Log levels: error, warn, info, debug
// - error:  Operation failures, caught exceptions, API errors
// - warn:   Degraded states, missing optional config, fallbacks activated
// - info:   Startup info, successful operations, state transitions
// - debug:  Detailed diagnostics (only shown when NODE_ENV === 'development')

const isDev = process.env.NODE_ENV !== 'production';

// Map level to a prefix emoji + label for quick visual scanning
const PREFIX = {
  error: '❌',
  warn:  '⚠️',
  info:  'ℹ️',
  debug: '🔍',
};

/**
 * Format a value for log output — extracts .message and .stack for Error objects,
 * JSON-stringifies objects, and returns primitives as-is.
 */
function formatValue(v) {
  if (v instanceof Error) {
    return isDev ? v.stack : v.message;
  }
  if (v && typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

/**
 * Build the log line array from variadic arguments.
 * Each non-first argument is formatted and joined.
 */
function buildArgs(level, ...args) {
  const timestamp = new Date().toISOString();
  const prefix = PREFIX[level] || '';
  const label = level.toUpperCase().padEnd(5);
  const header = `[${timestamp}] ${prefix} ${label}`;

  const parts = args.map(formatValue);
  return [`${header} —`, ...parts];
}

const logger = {
  error(...args) {
    console.error(...buildArgs('error', ...args));
  },

  warn(...args) {
    console.warn(...buildArgs('warn', ...args));
  },

  info(...args) {
    console.log(...buildArgs('info', ...args));
  },

  debug(...args) {
    if (isDev) {
      console.log(...buildArgs('debug', ...args));
    }
  },
};

module.exports = logger;
