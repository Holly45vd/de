// src/pages/CalendarPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
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
import { toSafeDate } from "../utils/firebaseHelpers";

export default function CalendarPage() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const [diaries, setDiaries] = useState([]);
  const [diariesByDate, setDiariesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedDiaries, setSelectedDiaries] = useState([]);

  /** Firestore에서 일기 불러오기 (타입 안전) */
  useEffect(() => {
    const fetchDiaries = async () => {
      if (!currentUser?.uid) return;

      try {
        const q = query(
          collection(db, "diaries"),
          where("userId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);

        const all = [];
        const byDate = {};

        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const safeDate = toSafeDate(data.date);
          const diary = {
            id: docSnap.id,
            ...data,
            date: safeDate, // JS Date | null
          };
          all.push(diary);

          if (safeDate) {
            const dateKey = dayjs(safeDate).format("YYYY-MM-DD");
            // 같은 날 여러 개면 마지막 mood만 쓰던 로직 유지 (원하면 배열로 확장 가능)
            if (!byDate[dateKey]) byDate[dateKey] = data.mood;
          }
        });

        setDiaries(all);
        setDiariesByDate(byDate);

        // 오늘 날짜 초기값
        const todayKey = dayjs().format("YYYY-MM-DD");
        setSelectedDate(todayKey);
        setSelectedDiaries(
          all.filter(
            (d) => d.date && dayjs(d.date).format("YYYY-MM-DD") === todayKey
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
      diaries.filter((d) => d.date && dayjs(d.date).format("YYYY-MM-DD") === dateKey)
    );
  };

  /** 달력 타일 렌더 (감정 아이콘/날짜) */
  const renderTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateKey = dayjs(date).format("YYYY-MM-DD");
    const moodKey = diariesByDate[dateKey];

    return (
      <div style={{ textAlign: "center", marginTop: "2px" }}>
        {moodKey ? (
          <img
            src={moodIcons[moodKey]?.color}
            alt={moodIcons[moodKey]?.ko || moodKey}
            style={{
              width: isMobile ? 30 : 60,
              height: isMobile ? 26 : 54,
              margin: "0 auto",
              display: "block",
              transition: "transform 0.2s",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: isMobile ? "0.7rem" : "0.9rem",
              color: "inherit",
            }}
          >
            {dayjs(date).date()}
          </span>
        )}
      </div>
    );
  };

  /** 일기 카드 클릭 → 상세 페이지 이동 */
  const handleCardClick = (id) => navigate(`/diary/${id}`);

  const primary = theme.palette.primary.main;

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: isMobile ? 420 : 960,
        mx: "auto",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h5"
        mb={3}
        sx={{ fontWeight: 800, color: "primary.main" }}
      >
        캘린더
      </Typography>

      {/* ===== 캘린더 ===== */}
      <Box
        sx={{
          mb: 4,
          ".react-calendar": {
            width: "100%",
            maxWidth: isMobile ? "380px" : "920px",
            fontSize: isMobile ? "0.85rem" : "1rem",
            borderRadius: "12px",
            padding: isMobile ? "6px" : "10px",
            border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
            background: theme.palette.background.paper,
          },
          ".react-calendar__tile": {
            flex: "1 0 calc(100% / 7)",
            height: isMobile ? "56px" : "92px",
            textAlign: "center",
            borderRadius: "8px",
            padding: "5px 0",
            transition: "0.2s",
            "&:hover": { backgroundColor: alpha(primary, 0.08) },
          },
          ".react-calendar__tile--active": {
            backgroundColor: primary,
            color: theme.palette.getContrastText(primary),
          },
        }}
      >
        <Calendar
          locale="ko"
          value={dayjs(selectedDate).toDate()}
          onClickDay={handleDateClick}
          tileContent={renderTileContent}
          formatDay={() => ""} // 기본 날짜 숫자는 타일 콘텐츠로 대체
        />
      </Box>

      {/* ===== 선택된 날짜의 일기 목록 ===== */}
      <Box sx={{ mt: 4 }}>
        {selectedDiaries.length > 0 ? (
          selectedDiaries.map((diary) => (
            <Card
              key={diary.id}
              onClick={() => handleCardClick(diary.id)}
              sx={{
                mb: 2,
                cursor: "pointer",
                borderRadius: 2,
                boxShadow: 1,
                "&:hover": { boxShadow: 4, backgroundColor: alpha(primary, 0.04) },
              }}
            >
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: "100%" }}
                >
                  {/* 왼쪽: 아이콘 + 내용 */}
                  <Box display="flex" alignItems="center" gap={1.5} sx={{ flex: 1 }}>
                    <img
                      src={moodIcons[diary.mood]?.color}
                      alt={moodIcons[diary.mood]?.ko || diary.mood}
                      style={{ width: 30, height: 30 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        flexGrow: 1,
                        textAlign: "left",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {diary.content || ""}
                    </Typography>
                  </Box>

                  {/* 오른쪽: 날짜 (MM-DD) */}
                  <Typography
                    variant="body2"
                    sx={{
                      minWidth: "64px",
                      textAlign: "center",
                      color: "text.secondary",
                      fontWeight: 700,
                    }}
                  >
                    {diary.date ? dayjs(diary.date).format("MM-DD") : "-"}
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
              variant="contained"
              color="primary"
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
