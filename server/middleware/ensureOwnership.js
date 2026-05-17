/**
 * Ensures the authenticated Firebase UID matches :userId in the route.
 */
function ensureOwnership(req, res, next) {
  if (!req.user?.uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({
      error: "Forbidden — you can only access your own resources",
    });
  }

  return next();
}

module.exports = ensureOwnership;
