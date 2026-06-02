// server/firebaseAdmin.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  const isPlaceholder = (val) => !val || val.includes('your_') || val.includes('YOUR_');

  if (projectId && clientEmail && privateKey && !isPlaceholder(projectId) && !isPlaceholder(clientEmail) && !isPlaceholder(privateKey)) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized from environment variables');
    } catch (err) {
      console.error('Firebase Admin initialization failed:', err.message);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      // fall back to Application Default Credentials (file referenced by env var)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log('Firebase Admin initialized using application default credentials');
    } catch (err) {
      console.error('Firebase Admin initialization with ADC failed:', err.message);
    }
  } else {
    console.warn(
      'Firebase Admin not initialized: missing credentials or using placeholder values. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in environment.'
    );
  }
}

module.exports = admin;
