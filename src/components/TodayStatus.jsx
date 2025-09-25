import React from "react";
import { Box, Typography, Button } from "@mui/material";
import dayjs from "dayjs";
import { moodIcons } from "../context/moodIcons";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFaceSadTear,
  faFaceTired,
  faFaceMeh,
  faFaceSmileWink,
  faFaceLaughBeam,
} from "@fortawesome/free-regular-svg-icons";
import {
  faFaceSadTear as fasFaceSadTear,
  faFaceTired as fasFaceTired,
  faFaceMeh as fasFaceMeh,
  faFaceSmileWink as fasFaceSmileWink,
  faFaceLaughBeam as fasFaceLaughBeam,
} from "@fortawesome/free-solid-svg-icons";

const scoreIcons = [
  { gray: faFaceSadTear, color: fasFaceSadTear, label: "매우 나쁨" },
  { gray: faFaceTired, color: fasFaceTired, label: "나쁨" },
  { gray: faFaceMeh, color: fasFaceMeh, label: "보통" },
  { gray: faFaceSmileWink, color: fasFaceSmileWink, label: "좋음" },
  { gray: faFaceLaughBeam, color: fasFaceLaughBeam, label: "매우 좋음" },
];

export default function TodayStatus({ todayDiary }) {
  const today = dayjs().format("MM-DD"); // 년도 제외하고 월-일만 표시
  const navigate = useNavigate();

  const handleViewDiary = () => {
    if (todayDiary?.id) {
      navigate(`/diary/${todayDiary.id}`);
    }
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        mb: 4,
        p: 3,
        borderRadius: 2,
        boxShadow: 2,
        cursor: todayDiary ? "pointer" : "default",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: todayDiary ? "#f0fdfa" : "#f9f9f9",
        },
      }}
      onClick={todayDiary ? handleViewDiary : undefined}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "var(--color-primary)",
          }}
        >
          오늘의 일기
        </Typography>

        {/* 날짜 - 회색 표시 */}
        <Typography
          variant="subtitle2"
          sx={{
            color: "#888",
            fontWeight: "normal",
          }}
        >
          {today}
        </Typography>
      </Box>

      {todayDiary ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={3}
          sx={{
            flexWrap: "wrap",
            mt: 2,
          }}
        >
          {/* 오늘의 기분 아이콘 */}
          {todayDiary.mood && moodIcons[todayDiary.mood]?.color && (
            <Box display="flex" alignItems="center" gap={1}>
              <img
                src={moodIcons[todayDiary.mood].color}
                alt="오늘의 기분"
                width={60}
                height={60}
                style={{ objectFit: "contain" }}
              />
              <Typography
                variant="body1"
                sx={{ color: "var(--color-primary)", fontWeight: "bold" }}
              >
                {moodIcons[todayDiary.mood].ko} ({moodIcons[todayDiary.mood].en})
              </Typography>
            </Box>
          )}

          {/* 오늘의 기분 점수 */}
          {todayDiary.score && (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "var(--color-primary)",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                기분 점수:
                <FontAwesomeIcon
                  icon={scoreIcons[todayDiary.score - 1]?.color || faFaceMeh}
                  size="2x"
                  style={{ color: "var(--color-primary)" }}
                />
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          {/* 오늘 일기 쓰기 버튼 */}
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
