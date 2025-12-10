// src/utils/formatDate.js
import dayjs from "dayjs";
import { toSafeDate } from "./firebaseHelpers";

/**
 * Diary용 공통 날짜 포맷터
 * @param value Firestore Timestamp | Date | string | null
 * @param format dayjs 포맷 문자열 (기본: YYYY-MM-DD)
 */
export const formatDiaryDate = (value, format = "YYYY-MM-DD") => {
  const d = toSafeDate(value);
  if (!d) return "";
  return dayjs(d).format(format);
};

/**
 * (구버전 호환용) timestamp 전용 포맷
 * 가능하면 formatDiaryDate를 사용 권장
 */
export const formatDate = (timestamp) => {
  const d = toSafeDate(timestamp);
  if (!d) return "";
  return dayjs(d).format("YYYY-MM-DD");
};
