function ensureOwnership(forbiddenMessage) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.uid !== req.params.userId) {
      return res.status(403).json({ error: forbiddenMessage });
    }

    next();
  };
}

module.exports = ensureOwnership;
