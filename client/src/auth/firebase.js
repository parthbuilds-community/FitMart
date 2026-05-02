// Mock Firebase auth safely

export const auth = {
  onAuthStateChanged: (callback) => {
    // simulate "not logged in user"
    callback(null);

    // return unsubscribe function (Firebase style)
    return () => {};
  },
};

export default {};