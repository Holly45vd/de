// src/utils/happinessQuote.js

const API_URL = "https://api.sobabear.com/happiness/random-quote";

// YYYY-MM-DD 형식 날짜
const getTodayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * 오늘 날짜 기준으로:
 * - localStorage에 이미 있으면 그거 사용
 * - 없으면 API에서 새로 가져옴
 * return: { content, author } | null
 */
export async function getDailyHappinessQuote() {
  const todayKey = getTodayKey();
  const storageKey = "daily_happiness_quote";

  try {
    // 1) localStorage 먼저 확인
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.date === todayKey && saved.quote) {
        return saved.quote;
      }
    }

    // 2) 없으면 API 호출
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error("API response not ok");
    }

    const json = await res.json();
    const quote = {
      content: json?.data?.content ?? "",
      author: json?.data?.author ?? "",
    };

    // 3) 오늘 날짜 기준으로 저장
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        date: todayKey,
        quote,
      })
    );

    return quote;
  } catch (e) {
    console.error("행복 명언 가져오기 실패:", e);
    return null;
  }
}
