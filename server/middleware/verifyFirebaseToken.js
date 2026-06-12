// server/middleware/verifyFirebaseToken.js
const admin = require('../firebaseAdmin');

const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID || process.env.VITE_SUPER_ADMIN_UID || '';

const isDev = process.env.NODE_ENV !== 'production';

// Development token prefix: 'dev:<email>'
const DEV_PREFIX = 'dev:';

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized — no token provided' } });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Development shortcut: accept tokens starting with 'dev:' when running locally
    if (isDev && typeof token === 'string' && token.startsWith(DEV_PREFIX)) {
      const email = token.slice(DEV_PREFIX.length);
      const uid = process.env.DEV_ADMIN_UID || `dev-admin-${(email || '').replace(/[^a-z0-9]/gi, '')}`;
      req.user = { uid, email, email_verified: true, name: 'Dev Admin' };
      return next();
    }

    const decoded = await admin.auth().verifyIdToken(token);

    // Allow the super-admin UID to bypass email verification
    if (!decoded.email_verified && decoded.uid !== SUPER_ADMIN_UID) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden — email not verified' } });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized — invalid or expired token' } });
  }
};

module.exports = verifyFirebaseToken;