import React from "react";
import { Box, Typography, Button } from "@mui/material";
import dayjs from "dayjs";
import { moodIcons } from "../context/moodIcons";
import { Link, useNavigate } from "react-router-dom";

export default function TodayStatus({ todayDiary }) {
  const today = dayjs().format("YYYY-MM-DD");
  const navigate = useNavigate();

  const handleViewDiary = () => {
    if (todayDiary?.id) {
      navigate(`/diary/${todayDiary.id}`);
    }
  };

  // 내용 미리보기 (50자 이상이면 자르기)
  const getContentPreview = (content) => {
    if (!content) return "";
    return content.length > 50 ? content.slice(0, 50) + "..." : content;
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        mb: 4,
        p: 3,
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
        boxShadow: 2,
        cursor: todayDiary ? "pointer" : "default",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: todayDiary ? "#f0fdfa" : "#f9f9f9",
        },
      }}
      onClick={todayDiary ? handleViewDiary : undefined}
    >
      <Typography variant="h6" gutterBottom>
        오늘의 일기 ({today})
      </Typography>

      {todayDiary ? (
        <Box>
          {/* 오늘의 기분 아이콘 (있을 때만 표시) */}
          {todayDiary.mood && moodIcons[todayDiary.mood]?.color && (
            <Box mb={1}>
              <img
                src={moodIcons[todayDiary.mood].color}
                alt="오늘의 기분"
                width={80}
                height={60}
                style={{ objectFit: "contain" }}
              />
            </Box>
          )}

          {/* === 오늘 일기 내용 미리보기 === */}
          {todayDiary.content && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                px: 1,
                color: "#333",
                textAlign: "center",
                whiteSpace: "pre-line", // 줄바꿈 유지
              }}
            >
              {getContentPreview(todayDiary.content)}
            </Typography>
          )}
        </Box>
      ) : (
        <Box>
          {/* 오늘 일기 쓰기 버튼 → /editor 경로 이동 */}
          <Button
            component={Link}
            to="/editor"
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "#45C4B0",
              "&:hover": {
                backgroundColor: "#38a99a",
              },
            }}
          >
            오늘 일기 쓰기
          </Button>
        </Box>
      )}
    </Box>
  );
}
