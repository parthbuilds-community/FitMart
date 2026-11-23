// server/firebaseAdmin.js
let firebaseAuth;

function getFirebaseAuth() {
  if (firebaseAuth) return firebaseAuth;

  // Loading firebase-admin/auth eagerly pulls in jose, an ESM-only dependency.
  // Keep it lazy so route and test imports do not execute it unless auth is used.
  const { initializeApp, getApps, cert, applicationDefault } = require('firebase-admin/app');
  const { getAuth } = require('firebase-admin/auth');

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (process.env.NODE_ENV === 'test') {
      initializeApp({ projectId: projectId || 'fitmart-test' });
    } else if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({ credential: applicationDefault() });
    } else {
      console.warn(
        'Firebase Admin not initialized: missing credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in environment.'
      );
    }
  }

  firebaseAuth = getAuth();
  return firebaseAuth;
}

module.exports = {
  auth: getFirebaseAuth,
};
