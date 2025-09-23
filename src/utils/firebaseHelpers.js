// src/utils/firebaseHelpers.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const saveDiary = async (userId, title, content, mood, score) => {
  try {
    await addDoc(collection(db, "diaries"), {
      userId,
      title,
      content,
      mood, // 기분 아이콘
      score, // 기분 점수
      date: serverTimestamp(), // ✅ Firestore 서버 시간
    });
    console.log("다이어리 저장 성공");
  } catch (error) {
    console.error("다이어리 저장 실패:", error.message);
  }
};
