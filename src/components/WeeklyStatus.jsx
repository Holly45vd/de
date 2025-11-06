import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { moodIcons } from "../context/moodIcons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

export default function WeeklyStatus() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [weekData, setWeekData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const today = dayjs();

  // 이번 주 월요일~일요일
  const weekStart = dayjs().startOf("week").add(1, "day");
  const weekEnd = weekStart.add(6, "day");

  // 총 9일: 지난주 일요일(-1) ~ 다음주 월요일(+1)
  const totalDays = [];
  for (let i = -1; i <= 7; i++) totalDays.push(weekStart.add(i, "day"));

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    const fetchWeeklyData = async () => {
      try {
        const q = query(
          collection(db, "diaries"),
          where("userId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const statusMap = {};
        totalDays.forEach((day) => {
          const dateKey = day.format("YYYY-MM-DD");
          const diary = items.find(
            (d) => dayjs(d.date.toDate()).format("YYYY-MM-DD") === dateKey
          );

          statusMap[dateKey] = diary
            ? { mood: diary.mood, id: diary.id }
            : { mood: null, id: null };
        });

        setWeekData(statusMap);
      } catch (e) {
        console.error("주간 데이터 불러오기 실패:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [currentUser]);

  if (loading) return null;

  return (
    <Box
      sx={{
        mb: 5,
        p: 2,
        borderRadius: 2,
        backgroundColor:
          theme.palette.mode === "light"
            ? alpha(theme.palette.primary.main, 0.04) // 연한 코랄 틴트
            : alpha(theme.palette.primary.main, 0.12),
      }}
    >
      <Grid container justifyContent="center" alignItems="center">
        {totalDays.map((day, idx) => {
          const dateKey = day.format("YYYY-MM-DD");
          const dayData = weekData[dateKey] || {};
          const { mood, id } = dayData;

          const isOutsideCurrentWeek = idx === 0 || idx === totalDays.length - 1;
          const isToday = day.isSame(today, "day");

          const iconSrc = mood
            ? moodIcons[mood]?.color
            : moodIcons["default"]?.gray || null;

          const isClickable = !!id;

          const handleClick = () => {
            if (isClickable) navigate(`/diary/${id}`);
          };

          return (
            <Grid
              item
              key={dateKey}
              sx={{
                textAlign: "center",
                minWidth: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isToday
                  ? alpha(theme.palette.primary.main, 0.12) // ✅ 민트 대체
                  : "transparent",
                borderRadius: 1,
                px: 0.5,
                py: 0.75,
                transition: "background-color 0.3s ease",
                cursor: isClickable ? "pointer" : "default",
                "&:hover": {
                  backgroundColor: isClickable
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                },
              }}
              onClick={handleClick}
            >
              {/* 요일 */}
              <Typography
                variant="subtitle2"
                sx={{
                  color: isOutsideCurrentWeek
                    ? "text.disabled"
                    : "text.primary",
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                {dayLabels[day.day()]}
              </Typography>

              {/* 날짜 */}
              <Typography
                variant="subtitle2"
                sx={{
                  color: isOutsideCurrentWeek
                    ? "text.disabled"
                    : "text.primary",
                  fontWeight: isToday ? 700 : 400,
                  mb: 1,
                }}
              >
                {day.format("D")}
              </Typography>

              {/* 아이콘 */}
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt={mood || "empty"}
                  style={{
                    width: 30,
                    height: 30,
                    opacity: isOutsideCurrentWeek ? 0.4 : isClickable ? 1 : 0.3,
                  }}
                />
              ) : (
                <Typography variant="body2" sx={{ mt: 1, color: "text.disabled" }}>
                  -
                </Typography>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
