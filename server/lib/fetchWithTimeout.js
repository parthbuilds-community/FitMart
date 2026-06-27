/**
 * Utility helpers for adding AbortController timeouts to external API calls.
 *
 * fetchWithTimeout   — wraps the global fetch() with a configurable timeout.
 * withTimeout        — wraps any Promise-returning call (SDK methods) with
 *                      a timeout and returns a clean error on expiry.
 */

/**
 * Thin wrapper around global fetch() that aborts the request if it
 * exceeds the specified timeout.
 *
 * @param {string|URL} url
 * @param {object}      [options]          — standard fetch options
 * @param {number}      [timeoutMs=10000]  — timeout in milliseconds
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchWithTimeout };
