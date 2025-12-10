// src/components/WeeklyStatus.jsx
import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { moodIcons } from "../context/moodIcons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

export default function WeeklyStatus({ diaries = [] }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const today = dayjs();

  // 이번 주 월요일~일요일
  const weekStart = dayjs().startOf("week").add(1, "day");
  const weekEnd = weekStart.add(6, "day");

  // 총 9일: 지난주 일요일(-1) ~ 다음주 월요일(+1)
  const totalDays = [];
  for (let i = -1; i <= 7; i++) totalDays.push(weekStart.add(i, "day"));

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <Box
      sx={{
        mb: 5,
        p: 2,
        borderRadius: 2,
        backgroundColor:
          theme.palette.mode === "light"
            ? alpha(theme.palette.primary.main, 0.04)
            : alpha(theme.palette.primary.main, 0.12),
      }}
    >
      <Grid container justifyContent="center" alignItems="center">
        {totalDays.map((day, idx) => {
          const dateKey = day.format("YYYY-MM-DD");

          // ✅ HomePage에서 내려온 diaries에서 해당 날짜 일기 찾기
          const diary = diaries.find(
            (d) =>
              d.date && dayjs(d.date).format("YYYY-MM-DD") === dateKey
          );

          const mood = diary?.mood ?? null;
          const id = diary?.id ?? null;

          const isOutsideCurrentWeek = idx === 0 || idx === totalDays.length - 1;
          const isToday = day.isSame(today, "day");

          const iconSrc = mood ? moodIcons[mood]?.color : null;
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
                  ? alpha(theme.palette.primary.main, 0.12)
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
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: "text.disabled" }}
                >
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
