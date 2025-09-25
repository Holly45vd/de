// src/pages/CalendarPage.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import Calendar from "react-calendar";
import "../styles/calendar.css";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { moodIcons } from "../context/moodIcons";
import { useNavigate } from "react-router-dom";
import EditNoteIcon from "@mui/icons-material/EditNote";

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [diaries, setDiaries] = useState([]);
  const [diariesByDate, setDiariesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedDiaries, setSelectedDiaries] = useState([]);

  /** Firestore에서 일기 불러오기 */
  useEffect(() => {
    const fetchDiaries = async () => {
      if (!currentUser?.uid) return;

      try {
        const q = query(collection(db, "diaries"), where("userId", "==", currentUser.uid));
        const snap = await getDocs(q);
        const allDiaries = [];
        const byDate = {};

        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const diary = { id: docSnap.id, ...data };
          allDiaries.push(diary);

          const dateKey = dayjs(data.date.toDate()).format("YYYY-MM-DD");
          if (!byDate[dateKey]) {
            byDate[dateKey] = data.mood;
          }
        });

        setDiaries(allDiaries);
        setDiariesByDate(byDate);

        // 오늘 날짜 초기값
        const todayKey = dayjs().format("YYYY-MM-DD");
        setSelectedDate(todayKey);
        setSelectedDiaries(
          allDiaries.filter(
            (d) => dayjs(d.date.toDate()).format("YYYY-MM-DD") === todayKey
          )
        );
      } catch (error) {
        console.error("캘린더 데이터 불러오기 오류:", error);
      }
    };

    fetchDiaries();
  }, [currentUser]);

  /** 날짜 클릭 시 해당 날짜의 일기만 필터링 */
  const handleDateClick = (date) => {
    const dateKey = dayjs(date).format("YYYY-MM-DD");
    setSelectedDate(dateKey);
    setSelectedDiaries(
      diaries.filter((d) => dayjs(d.date.toDate()).format("YYYY-MM-DD") === dateKey)
    );
  };

  /** 달력 안에 감정 아이콘 표시 */
  const renderTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateKey = dayjs(date).format("YYYY-MM-DD");

    if (diariesByDate[dateKey]) {
      const moodKey = diariesByDate[dateKey];
      return (
        <div style={{ textAlign: "center", marginTop: "2px" }}>
          <img
            src={moodIcons[moodKey]?.color}
            alt={moodIcons[moodKey]?.ko}
            style={{
              width: 32,
              height: 28,
              margin: "0 auto",
              transition: "transform 0.2s",
            }}
          />
        </div>
      );
    }
    return null;
  };

  /** 일기 카드 클릭 → 상세 페이지 이동 */
  const handleCardClick = (id) => navigate(`/diary/${id}`);

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: 800,
        mx: "auto",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h5"
        mb={3}
        sx={{ fontWeight: "bold", color: "var(--color-primary)" }}
      >
        캘린더
      </Typography>

      {/* ===== 캘린더 ===== */}
      <Box sx={{ mb: 4 }}>
        <Calendar
          locale="ko"
          value={dayjs(selectedDate).toDate()}
          onClickDay={handleDateClick}
          tileContent={renderTileContent}
          formatDay={(locale, date) => dayjs(date).date().toString()}
          tileClassName={({ date }) => {
            const dateKey = dayjs(date).format("YYYY-MM-DD");
            const todayKey = dayjs().format("YYYY-MM-DD");
            if (dateKey === todayKey) return "today-highlight";
            if (diariesByDate[dateKey]) return "has-diary";
            return "";
          }}
        />
      </Box>

      {/* ===== 선택된 날짜의 일기 목록 ===== */}
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: "bold",
            color: "var(--color-primary)",
          }}
        >
          {selectedDate}의 일기
        </Typography>

        {selectedDiaries.length > 0 ? (
          selectedDiaries.map((diary) => (
            <Card
              key={diary.id}
              className="card"
              onClick={() => handleCardClick(diary.id)}
              sx={{
                mb: 2,
                cursor: "pointer",
                "&:hover": { boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <img
                    src={moodIcons[diary.mood]?.color}
                    alt={moodIcons[diary.mood]?.ko}
                    style={{ width: 30, height: 30 }}
                  />
                  <Typography variant="body1" sx={{ flexGrow: 1, textAlign: "left" }}>
                    {diary.content.length > 20
                      ? `${diary.content.slice(0, 20)}...`
                      : diary.content}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography sx={{ mb: 2 }}>
              {selectedDate === dayjs().format("YYYY-MM-DD")
                ? "오늘 작성된 일기가 없습니다."
                : "이 날짜에는 작성된 일기가 없습니다."}
            </Typography>
            <Button
              className="btn-primary"
              startIcon={<EditNoteIcon />}
              onClick={() => navigate("/editor")}
            >
              새 일기 쓰기
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
