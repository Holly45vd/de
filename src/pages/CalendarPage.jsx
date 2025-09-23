// src/pages/CalendarPage.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import Calendar from "react-calendar";
import "../styles/calendar.css";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { moodIcons } from "../context/moodIcons";
import { useNavigate } from "react-router-dom";

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [diaries, setDiaries] = useState([]);
  const [diariesByDate, setDiariesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedDiaries, setSelectedDiaries] = useState([]);

  useEffect(() => {
    const fetchDiaries = async () => {
      if (!currentUser?.uid) return;

      try {
        const q = query(
          collection(db, "diaries"),
          where("userId", "==", currentUser.uid)
        );

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

        // 오늘 날짜 기준으로 초기 세팅
        const todayKey = dayjs().format("YYYY-MM-DD");
        const todayDiaries = allDiaries.filter(
          (diary) =>
            dayjs(diary.date.toDate()).format("YYYY-MM-DD") === todayKey
        );
        setSelectedDiaries(todayDiaries);
        setSelectedDate(todayKey);
      } catch (error) {
        console.error("캘린더 데이터 불러오기 오류:", error);
      }
    };

    fetchDiaries();
  }, [currentUser]);

  const handleDateClick = (date) => {
    const dateKey = dayjs(date).format("YYYY-MM-DD");
    setSelectedDate(dateKey);

    const filtered = diaries.filter(
      (diary) => dayjs(diary.date.toDate()).format("YYYY-MM-DD") === dateKey
    );

    setSelectedDiaries(filtered);
  };

  const renderTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateKey = dayjs(date).format("YYYY-MM-DD");

    if (diariesByDate[dateKey]) {
      return (
        <div style={{ fontSize: "1.2rem", marginTop: "4px" }}>
          {moodIcons[diariesByDate[dateKey]]}
        </div>
      );
    }
    return null;
  };

  const handleCardClick = (id) => {
    navigate(`/diary/${id}`);
  };

  return (
    <Box sx={{ p: 2, mt: 8, textAlign: "center" }}>
      <Typography variant="h5" mb={2}>
        캘린더
      </Typography>

      {/* 캘린더 */}
      <Calendar
        locale="ko"
        value={dayjs(selectedDate).toDate()}
        onClickDay={handleDateClick}
        tileContent={renderTileContent}
      />

      {/* 선택된 날짜의 일기 목록 */}
      <Box sx={{ mt: 4, maxWidth: 500, mx: "auto" }}>
        {selectedDate && (
          <Typography variant="h6" mb={2}>
            {selectedDate}의 일기
          </Typography>
        )}

        {selectedDiaries.length > 0 ? (
          selectedDiaries.map((diary) => (
            <Card
              key={diary.id}
              sx={{
                mb: 2,
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { backgroundColor: "#e6f7ff" },
              }}
              onClick={() => handleCardClick(diary.id)}
            >
              <CardContent>
                <Typography variant="body2">
                  {moodIcons[diary.mood]} X {diary.score}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {diary.content.length > 20
                    ? `${diary.content.slice(0, 20)}...`
                    : diary.content}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>
            {selectedDate === dayjs().format("YYYY-MM-DD")
              ? "오늘 작성된 일기가 없습니다."
              : "이 날짜에는 작성된 일기가 없습니다."}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
