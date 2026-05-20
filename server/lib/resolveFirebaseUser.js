const admin = require('../firebaseAdmin');

async function resolveFirebaseUser(uid) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return {
      displayName: userRecord.displayName || '—',
      email: userRecord.email || '—',
      photoURL: userRecord.photoURL || null,
    };
  } catch {
    return { displayName: '—', email: '—', photoURL: null };
  }
}

module.exports = resolveFirebaseUser;
