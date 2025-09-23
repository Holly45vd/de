// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD36IZogd6NoYHB8XHsxJ6MAKIN7p_6j5Q",
  authDomain: "myapp-f3a5c.firebaseapp.com",
  projectId: "myapp-f3a5c",
  storageBucket: "myapp-f3a5c.firebasestorage.app",
  messagingSenderId: "966520749263",
  appId: "1:966520749263:web:2f23b9f438c61eb718cbba",
  measurementId: "G-7NLSFVDT7J",
};

// Firebase 초기화
export const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Firebase Auth
export const auth = getAuth(app);
