// server/firebaseAdmin.js
const admin = require('firebase-admin');
const logger = require('./lib/logger');

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    logger.info('Firebase Admin initialized from environment variables');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // fall back to Application Default Credentials (file referenced by env var)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    logger.info('Firebase Admin initialized using application default credentials');
  } else {
    logger.warn(
      'Firebase Admin not initialized: missing credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in environment.'
    );
  }
}

module.exports = admin;
