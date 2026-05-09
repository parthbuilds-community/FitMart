// src/auth/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;