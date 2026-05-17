/**
 * Ensures the authenticated Firebase user matches the resource owner id.
 * Must run after verifyFirebaseToken.
 */
const ensureOwnership = ({
  source = "params",
  field = "userId",
  message = "Forbidden — you can only access your own resources",
} = {}) => {
  return (req, res, next) => {
    const ownerId = source === "body" ? req.body?.[field] : req.params?.[field];

    if (!ownerId || req.user?.uid !== ownerId) {
      return res.status(403).json({ error: message });
    }

    return next();
  };
};

module.exports = ensureOwnership;
