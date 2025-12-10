// src/utils/firebaseHelpers.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/** Firestore Timestamp | Date | string -> JS Date 또는 null */
export function toSafeDate(v) {
  if (!v) return null;
  try {
    if (typeof v?.toDate === "function") return v.toDate();
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/** 다이어리 문서 정규화 */
export function normalizeDiary(raw) {
  const date = toSafeDate(raw?.date);           // ‘해당일’ (캘린더에서 선택한 날짜)
  const createdAt = toSafeDate(raw?.createdAt); // 실제 작성한 시각
  const updatedAt = toSafeDate(raw?.updatedAt); // 수정한 시각(있으면)

  const score = raw?.score == null ? null : Number(raw.score);

  return {
    id: raw?.id || "",
    userId: raw?.userId || "",
    title: raw?.title || "",
    content: raw?.content || "",
    mood: raw?.mood || null,
    score: Number.isNaN(score) ? null : score,
    date,       // 해당일
    createdAt,  // 작성 시각
    updatedAt,  // 수정 시각
  };
}


/** 저장(임시 날짜 반환으로 UI 즉시 반영) */
export const saveDiary = async (userId, title, content, mood, score) => {
  try {
    const ref = await addDoc(collection(db, "diaries"), {
      userId,
      title,
      content,
      mood,
      score,
      date: serverTimestamp(), // 서버 시간
    });
    return {
      id: ref.id,
      userId,
      title,
      content,
      mood,
      score,
      date: new Date(), // 서버 확정 전 임시 표시
    };
  } catch (error) {
    console.error("다이어리 저장 실패:", error.message);
    return null;
  }
};
