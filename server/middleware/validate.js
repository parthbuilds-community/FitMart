/**
 * Express middleware factory that validates req.body with a Zod schema.
 * On success, replaces req.body with parsed/coerced values.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    return next();
  };
}

module.exports = { validateBody };
