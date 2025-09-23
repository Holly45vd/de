// src/components/DiaryCard.jsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { moodIcons } from "../context/moodIcons";

export default function DiaryCard({ diary, onClick }) {
  // 날짜 변환 함수
  const formatDate = (date) => {
    if (!date) return ""; // date가 null이면 빈 문자열
    if (typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString();
    }
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }
    return "";
  };

  const moodIcon = diary?.mood ? moodIcons[diary.mood] || "❔" : "❔";


  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 2,
        cursor: "pointer",
        backgroundColor: "#f9f9f9",
      }}
    >
      <CardContent>
        {/* 감정 아이콘 + 점수 표시 */}
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            {moodIcon || "❔"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {diary?.score ? ` X ${diary.score}` : ""}
          </Typography>
        </Box>

        <Typography variant="body2" color="textSecondary">
          {formatDate(diary?.date)}
        </Typography>
      </CardContent>
    </Card>
  );
}
