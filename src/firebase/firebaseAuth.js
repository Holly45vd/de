// src/firebase/firebaseAuth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

// 회원가입
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// 로그인
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// 로그아웃
export const logout = () => {
  return signOut(auth);
};
