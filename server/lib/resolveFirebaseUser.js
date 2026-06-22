const { getAuth } = require('firebase-admin/auth');

module.exports = async (uid) => {
  try {
    const user = await getAuth().getUser(uid);
    return {
      displayName: user.displayName || "—",
      photoURL: user.photoURL || null,
      email: user.email || "—",
    };
  } // eslint-disable-next-line no-unused-vars
  catch (err) {
    return { displayName: "—", photoURL: null, email: "—" };
  }
};