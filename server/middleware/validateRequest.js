const { ZodError } = require('zod');

function formatPath(path) {
  return path.length ? path.join('.') : 'request';
}

function validateRequest(schema) {
  return (req, res, next) => {
    try {
      if (schema.params) req.params = schema.params.parse(req.params);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.body) req.body = schema.body.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
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
