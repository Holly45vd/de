// src/components/DiaryCard.jsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { moodIcons } from "../context/moodIcons";
import { formatDiaryDate } from "../utils/formatDate";

export default function DiaryCard({ diary, onClick }) {
  const moodData = diary?.mood ? moodIcons[diary.mood] : null;
  const preview =
    diary?.content?.length > 80
      ? diary.content.slice(0, 80) + "..."
      : diary?.content || "내용이 없습니다.";

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 2,
        cursor: onClick ? "pointer" : "default",
        borderRadius: 2,
        boxShadow: 1,
        "&:hover": {
          boxShadow: onClick ? 3 : 1,
        },
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* 아이콘 */}
        <Box sx={{ flexShrink: 0 }}>
          {moodData?.color ? (
            <img
              src={moodData.color}
              alt={diary.mood}
              style={{ width: 48, height: 48 }}
            />
          ) : (
            <Typography fontSize={32}>📝</Typography>
          )}
        </Box>

        {/* 내용 + 날짜/점수 */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {preview}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {formatDiaryDate(diary?.date, "YYYY.MM.DD")}
            </Typography>
            {diary?.score != null && (
              <Typography variant="caption" color="text.secondary">
                점수 {diary.score}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
