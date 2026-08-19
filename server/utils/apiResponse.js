// server/utils/apiResponse.js
// Consistent API response contract.
//   success: { success: true, ...data }
//   error:   { success: false, error: message }
//
// The `error` key is always present on failures so existing clients that read
// `data.error` keep working. Success shapes are migrated incrementally (see the
// API contract note in README.md) — prefer `ok()` for new endpoints.

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object} data - Extra fields merged into the response body
 * @param {number} [status=200]
 */
function ok(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, ...data });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message - Human-readable error message
 * @param {number} [status=400]
 */
function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

module.exports = { ok, fail };
