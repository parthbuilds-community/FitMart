// client/e2e/firebaseAuthMock.js
// This file IS NOT imported directly. Its content is used as a string
// by the E2E test via page.route() to replace the Vite-served
// firebase/auth dependency with a mock that returns a test user.

// To use this mock, the test intercepts the Vite dep path for firebase/auth.
// In Vite dev mode, dependencies are served from /node_modules/.vite/deps/.
// The exact URL pattern is: **firebase_auth**

const MOCK_AUTH_SCRIPT = `
// Mock firebase/auth module for E2E testing
var __mockUser = {
  uid: 'test-user-123',
  email: 'test@fitmart.in',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  getIdToken: function() { return Promise.resolve('mock-firebase-id-token'); },
  toJSON: function() { return { uid: 'test-user-123', email: 'test@fitmart.in', displayName: 'Test User' }; }
};

var __mockAuth = {
  currentUser: __mockUser,
  name: 'mock-auth-instance',
};

function onAuthStateChanged(auth, callback) {
  setTimeout(function() { callback(__mockUser); }, 0);
  return function unsubscribe() {};
}

function getAuth() {
  return __mockAuth;
}

function signOut() {
  __mockAuth.currentUser = null;
  return Promise.resolve();
}

function signInWithEmailAndPassword(auth, email, password) {
  return Promise.resolve({ user: __mockUser });
}

function createUserWithEmailAndPassword(auth, email, password) {
  return Promise.resolve({ user: __mockUser });
}

function sendPasswordResetEmail(auth, email) {
  return Promise.resolve();
}

function GoogleAuthProvider() {}
GoogleAuthProvider.prototype = {};
GoogleAuthProvider.credential = function() {};
GoogleAuthProvider.PROVIDER_ID = 'google.com';

function signInWithPopup(auth, provider) {
  return Promise.resolve({ user: __mockUser, credential: null });
}

export {
  onAuthStateChanged,
  getAuth,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
};
`;

// Mock for firebase/app module
const MOCK_APP_SCRIPT = `
// Mock firebase/app module for E2E testing
var __mockApp = { name: '[DEFAULT]', options: {} };

function initializeApp(config, name) {
  return __mockApp;
}

function getApp(name) {
  return __mockApp;
}

function deleteApp(app) {
  return Promise.resolve();
}

export {
  initializeApp,
  getApp,
  deleteApp,
};
`;

export { MOCK_AUTH_SCRIPT, MOCK_APP_SCRIPT };
