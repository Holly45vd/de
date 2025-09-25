// src/firebase/firebaseAuth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, updateDoc } from "firebase/firestore";

/** 
 * 랜덤 닉네임 생성 
 * - 회원가입 시 기본 닉네임 자동 생성
 */
const generateRandomNickname = () => {
  const randomStr = Math.random().toString(36).substring(2, 8); // 6자리 랜덤 문자열
  return `user_${randomStr}`;
};

/**
 * 회원가입
 * - Firebase Auth에 계정을 생성하고
 * - Firestore의 users 컬렉션에도 사용자 정보 저장
 */
export const signUp = async (email, password) => {
  try {
    // 1) Firebase Auth 계정 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2) Firestore에 사용자 문서 생성
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      nickname: generateRandomNickname(), // 기본 닉네임 자동 생성
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("회원가입 실패:", error.message);
    throw error;
  }
};

/**
 * 로그인
 * - Firebase Auth 이메일/비밀번호 로그인
 */
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * 로그아웃
 * - Firebase Auth에서 현재 로그인된 사용자 로그아웃
 */
export const logout = () => {
  return signOut(auth);
};

/**
 * 닉네임 업데이트
 * - Firestore의 users 컬렉션에 닉네임 업데이트
 */
export const updateNickname = async (userId, newNickname) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      nickname: newNickname,
      updatedAt: new Date(),
    });
    console.log("닉네임 업데이트 성공!");
  } catch (error) {
    console.error("닉네임 업데이트 실패:", error.message);
    throw error;
  }
};

/**
 * 비밀번호 변경
 * - Firebase Auth에서 현재 로그인된 사용자의 비밀번호 변경
 */
export const changePassword = async (newPassword) => {
  try {
    if (!auth.currentUser) {
      throw new Error("로그인된 사용자가 없습니다.");
    }

    await updatePassword(auth.currentUser, newPassword);
    console.log("비밀번호 변경 성공!");
  } catch (error) {
    console.error("비밀번호 변경 실패:", error.message);
    throw error;
  }
};
