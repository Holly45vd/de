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

  // ✅ 파이어스토어에서 일기 데이터 불러오기
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
          // 같은 날짜에 여러 개가 있어도 하나의 아이콘만 표시
          if (!byDate[dateKey]) {
            byDate[dateKey] = data.mood;
          }
        });

        setDiaries(allDiaries);
        setDiariesByDate(byDate);

        // 오늘 날짜 초기값 설정
        const todayKey = dayjs().format("YYYY-MM-DD");
        const todayDiaries = allDiaries.filter(
          (diary) => dayjs(diary.date.toDate()).format("YYYY-MM-DD") === todayKey
        );
        setSelectedDiaries(todayDiaries);
        setSelectedDate(todayKey);
      } catch (error) {
        console.error("캘린더 데이터 불러오기 오류:", error);
      }
    };

    fetchDiaries();
  }, [currentUser]);

  // ✅ 날짜 클릭 시 해당 날짜의 일기 목록 표시
  const handleDateClick = (date) => {
    const dateKey = dayjs(date).format("YYYY-MM-DD");
    setSelectedDate(dateKey);

    const filtered = diaries.filter(
      (diary) => dayjs(diary.date.toDate()).format("YYYY-MM-DD") === dateKey
    );

    setSelectedDiaries(filtered);
  };

  // ✅ 캘린더 타일 표시
  const renderTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateKey = dayjs(date).format("YYYY-MM-DD");

    // 해당 날짜에 일기가 있으면 날짜 대신 아이콘 크게 표시
    if (diariesByDate[dateKey]) {
      return (
        <div
          style={{
            textAlign: "center",
            marginTop: "2px",
          }}
        >
          <img
            src={moodIcons[diariesByDate[dateKey]]?.color}
            alt="mood"
            style={{
              width: 40,
              height: 32,
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
      );
    }

    // 없으면 기본 날짜 표시 유지
    return (
      <div
        style={{
          fontSize: "0.9rem",
          textAlign: "center",
          marginTop: "4px",
          color: "#333",
        }}
      >
        {date.getDate()}
      </div>
    );
  };

  const handleCardClick = (id) => {
    navigate(`/diary/${id}`);
  };

  return (
    <Box sx={{ p: 2, mt:2, textAlign: "center" }}>
      <Typography variant="h5" mb={2}>
        캘린더
      </Typography>

      {/* 캘린더 */}
      <Calendar
        locale="ko"
        value={dayjs(selectedDate).toDate()}
        onClickDay={handleDateClick}
        tileContent={renderTileContent}
        tileClassName={({ date }) => {
          const dateKey = dayjs(date).format("YYYY-MM-DD");
          return diariesByDate[dateKey] ? "has-diary" : "";
        }}
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
                {/* 감정 아이콘 + 점수 */}
                <Box display="flex" alignItems="center" gap={1}>
                  <img
                    src={moodIcons[diary.mood]?.color}
                    alt={diary.mood}
                    style={{ width: 30, height: 30 }}
                  />
                  <Typography variant="body2"> 여기에 기분 아이콘이 들어가야하는데 </Typography>
                </Box>

                {/* 내용 */}
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {diary.content.length > 20
                    ? `${diary.content.slice(0, 20)}...`
                    : diary.content}
                </Typography>
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

            {/* 새 일기 쓰기 버튼 */}
            <Button
              variant="contained"
              startIcon={<EditNoteIcon />}
              onClick={() => navigate("/editor")}
              sx={{
                backgroundColor: "#45C4B0",
                color: "#fff",
                fontWeight: "bold",
                px: 3,
                "&:hover": {
                  backgroundColor: "#3ca896",
                },
              }}
            >
              새 일기 쓰기
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
