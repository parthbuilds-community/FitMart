// server/middleware/verifyAdmin.js
const ADMIN_UID = process.env.ADMIN_UID || process.env.VITE_ADMIN_UID || '';
const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID || process.env.VITE_SUPER_ADMIN_UID || '';

const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized — no user found' });
  }

  const isAuthorized = (ADMIN_UID && req.user.uid === ADMIN_UID) || 
                       (SUPER_ADMIN_UID && req.user.uid === SUPER_ADMIN_UID);

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Forbidden — admin access required' });
  }

  next();
};

module.exports = verifyAdmin;
