// server/middleware/verifyFirebaseToken.js
const admin = require('../firebaseAdmin');

const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID || process.env.VITE_SUPER_ADMIN_UID || '';

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Allow the super-admin UID to bypass email verification
    if (!decoded.email_verified && decoded.uid !== SUPER_ADMIN_UID) {
      return res.status(403).json({ error: 'Forbidden — email not verified' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
  }
};

module.exports = verifyFirebaseToken;