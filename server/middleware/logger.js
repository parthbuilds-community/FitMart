// server/middleware/logger.js
var express = require("express");
var morgan = require("morgan");

var app = express();
app.use(morgan('dev'));
app.use(express.json());
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

morgan.token("base-route", (req) => {
  return getBaseRoute(req.originalUrl);
});
morgan.token("timestamp", () => {
  return new Date().toISOString();
});

const logger = morgan(function (tokens, req, res) {
  return [
    `[${tokens.timestamp(req, res)}]`,
    tokens.method(req, res),
    tokens.status(req, res),
    tokens["base-route"](req, res),
    `(${tokens["response-time"](req, res)} ms)`
  ].join(" ");
});

app.use(logger);
app.use((req, res, next) => {
  try {
    if (
      req.method !== "GET" && req.body && (Object.keys(req.body).length > 0)
    ) {
      const safeBody = { ...req.body };
      ['password', 'token', 'secret', 'apikey'].forEach((key) => {
        if (safeBody[key]) {
          safeBody[key] = "[REDACTED]";
        }
      });

      const bodyStr = JSON.stringify(safeBody);
      if (bodyStr.length < 1000) {
        console.log(` Body: ${bodyStr}`);
      } else {
        console.log(` Body : [Log length exceeded]`);
      }
    }
  } catch (err) {
    console.log(`Body : [Error parsing body]`);
  }
  next();

});

module.exports = logger;
