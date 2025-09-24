// src/components/DiaryCard.jsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { moodIcons } from "../context/moodIcons";

export default function DiaryCard({ diary, onClick }) {
  // 날짜 변환 함수
  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString();
    }
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString();
    }
    return "";
  };

  // 감정 아이콘 가져오기 (이미지 기반)
  const moodIcon = diary?.mood ? moodIcons[diary.mood]?.color : null;

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 2,
        cursor: "pointer",
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 1,
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        {/* 감정 아이콘 + 점수 */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            {moodIcon ? (
              <img
                src={moodIcon}
                alt="mood"
                style={{ width: 32, height: 32 }}
              />
            ) : (
              <Typography variant="body2">❔</Typography>
            )}
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {diary?.mood?.split(" ")[1] || "미정"}
            </Typography>
          </Box>
          {diary?.score && (
            <Typography
              variant="body1"
              sx={{ color: "#45C4B0", fontWeight: "bold" }}
            >
              {diary.score} 
            </Typography>
          )}
        </Box>

        {/* 날짜 */}
        <Typography variant="caption" color="textSecondary">
          {formatDate(diary?.date)}
        </Typography>
      </CardContent>
    </Card>
  );
}
