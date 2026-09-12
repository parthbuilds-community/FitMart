const { ZodError } = require('zod');

function formatPath(path) {
  return path.length ? path.join('.') : 'request';
}

// Express 5 exposes `req.query` as a getter on the request prototype, so a plain
// `req.query = ...` assignment is silently ignored and the parsed/coerced values
// never reach the route handler. Defining an own property shadows the getter.
function setParsedQuery(req, value) {
  Object.defineProperty(req, 'query', {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

function validateRequest(schema) {
  return (req, res, next) => {
    try {
      if (schema.params) req.params = schema.params.parse(req.params);
      if (schema.query) setParsedQuery(req, schema.query.parse(req.query));
      if (schema.body) req.body = schema.body.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          details: err.issues.map(issue => ({
            path: formatPath(issue.path),
            message: issue.message,
          })),
        });
      }

      next(err);
    }
  };
}

module.exports = validateRequest;
