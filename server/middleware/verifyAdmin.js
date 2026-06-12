// server/middleware/verifyAdmin.js
const ADMIN_UID = process.env.ADMIN_UID || process.env.VITE_ADMIN_UID || '';
const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID || process.env.VITE_SUPER_ADMIN_UID || '';
const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || '';
const isDev = process.env.NODE_ENV !== 'production';

const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized — no user found' } });
  }

  // Production check: match UIDs
  const isProductionAuthorized = (ADMIN_UID && req.user.uid === ADMIN_UID) ||
    (SUPER_ADMIN_UID && req.user.uid === SUPER_ADMIN_UID);

  if (isProductionAuthorized) return next();

  // Development: allow matching dev admin email or uid when running locally
  if (isDev) {
    if (DEV_ADMIN_EMAIL && req.user.email && req.user.email === DEV_ADMIN_EMAIL) return next();
    if (process.env.DEV_ADMIN_UID && req.user.uid === process.env.DEV_ADMIN_UID) return next();
  }

  return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden — admin access required' } });
};

module.exports = verifyAdmin;
