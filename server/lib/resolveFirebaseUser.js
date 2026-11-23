module.exports = async (uid) => {
  try {
    const admin = require('../firebaseAdmin');
    const user = await admin.auth().getUser(uid);
    return {
      displayName: user.displayName || "—",
      photoURL: user.photoURL || null,
      email: user.email || "—",
    };
  } catch (err) {
    return { displayName: "—", photoURL: null, email: "—" };
  }
};