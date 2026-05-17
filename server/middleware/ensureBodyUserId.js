/**
 * Ensures the authenticated Firebase UID matches userId in the request body.
 */
function ensureBodyUserId(req, res, next) {
  if (!req.user?.uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }

  if (req.user.uid !== userId) {
    return res.status(403).json({
      error: "Forbidden — you can only act on your own account",
    });
  }

  return next();
}

module.exports = ensureBodyUserId;
