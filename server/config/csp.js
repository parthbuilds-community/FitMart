// server/config/csp.js
// Strict Content Security Policy directives for the FitMart API server.
//
// The server is primarily a JSON API, so CSP is configured with
// a deny-by-default posture for defense-in-depth protection.

const CSP_DIRECTIVES = {
  // Deny everything by default — explicitly whitelist only what is needed.
  defaultSrc: ["'none'"],

  // Allow same-origin scripts (e.g., any inline health-check page).
  scriptSrc: ["'self'"],

  // Block all inline JavaScript event handlers.
  scriptSrcAttr: ["'none'"],

  // Allow same-origin styles with inline fallback.
  styleSrc: ["'self'", "'unsafe-inline'"],

  // Only self-hosted fonts.
  fontSrc: ["'self'"],

  // Images from self or inline data URIs.
  imgSrc: ["'self'", "data:"],

  // Fetch/XHR only to the same origin.
  connectSrc: ["'self'"],

  // Disallow all plugin content (Flash, etc.).
  objectSrc: ["'none'"],

  // Prevent clickjacking — disallow all framing.
  frameAncestors: ["'none'"],

  // Only allow form submissions to the same origin.
  formAction: ["'self'"],

  // Block <base> tag injection.
  baseUri: ["'none'"],

  // Upgrade HTTP requests to HTTPS in production.
  upgradeInsecureRequests: [],
};

module.exports = CSP_DIRECTIVES;
