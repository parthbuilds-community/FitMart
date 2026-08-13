// server/middleware/verifyAdmin.js
const UserProfile = require('../models/UserProfile');

const verifyAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized — no user found' });
  }

  try {
    const profile = await UserProfile.findOne({ userId: req.user.uid });
    if (profile && profile.role === 'admin') return next();
  } catch (err) {
    console.error('verifyAdmin db error:', err.message);
  }

  // Fallback: allow matching env UIDs for backward compatibility
  // during migration until all admins have role='admin' in the database
  const ADMIN_UID = process.env.ADMIN_UID || process.env.VITE_ADMIN_UID || '';
  const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID || process.env.VITE_SUPER_ADMIN_UID || '';
  if (ADMIN_UID && req.user.uid === ADMIN_UID) return next();
  if (SUPER_ADMIN_UID && req.user.uid === SUPER_ADMIN_UID) return next();

  // Development: allow matching dev admin email or uid when running locally
  const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || '';
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    if (DEV_ADMIN_EMAIL && req.user.email && req.user.email === DEV_ADMIN_EMAIL) return next();
    if (process.env.DEV_ADMIN_UID && req.user.uid === process.env.DEV_ADMIN_UID) return next();
  }

  return res.status(403).json({ error: 'Forbidden — admin access required' });
};

module.exports = verifyAdmin;
