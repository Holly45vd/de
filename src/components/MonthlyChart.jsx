// src/components/MonthlyChart.jsx
import React, { useMemo, useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Typography,
  Modal,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { moodIcons } from "../context/moodIcons";

dayjs.locale("ko");

export default function MonthlyChart({ diaries = [] }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const textSecondary = theme.palette.text.secondary;

  const [open, setOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState(null); // YYYY-MM-DD
  const [selectedDiaries, setSelectedDiaries] = useState([]);

  // ✅ 날짜별 그룹
  const diariesByDate = useMemo(() => {
    const map = {};
    diaries.forEach((d) => {
      if (!d.date) return;
      const key = dayjs(d.date).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(d);
    });
    return map;
  }, [diaries]);

  // ✅ 최근 30일 차트 데이터
  const chartData = useMemo(() => {
    if (!diaries.length) return [];

    const today = dayjs().endOf("day");
    const start = today.subtract(29, "day").startOf("day");

    const points = [];

    for (let i = 0; i < 30; i++) {
      const day = start.add(i, "day");
      const key = day.format("YYYY-MM-DD");
      const list = diariesByDate[key] || [];

      const avgScore =
        list.length > 0
          ? list.reduce((sum, d) => sum + (d.score || 0), 0) / list.length
          : 0;

      points.push({
        key, // YYYY-MM-DD
        date: day.format("MM-DD"),
        score: avgScore,
      });
    }

    return points;
  }, [diariesByDate, diaries.length]);

  const maxScore =
    chartData.length > 0
      ? Math.max(5, ...chartData.map((item) => item.score || 0))
      : 5;

  const handleDotClick = (payload) => {
    if (!payload || !payload.key) return;
    const key = payload.key; // YYYY-MM-DD
    setSelectedDateKey(key);
    setSelectedDiaries(diariesByDate[key] || []);
    setOpen(true);
  };

  return (
    <Box
      sx={{
        mt: 4,
        p: 2,
        borderRadius: 2,
        backgroundColor:
          theme.palette.mode === "light"
            ? alpha(primary, 0.04)
            : alpha(primary, 0.12),
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 800, color: "primary.main" }}
      >
        최근 30일 기분 점수
      </Typography>

      {chartData.length === 0 ? (
        <Typography color="text.secondary">
          최근 30일 동안 작성된 일기가 없습니다.
        </Typography>
      ) : (
        <Box sx={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(textSecondary, 0.3)} />
              <XAxis
                dataKey="date"
                stroke={textSecondary}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke={textSecondary}
                domain={[0, maxScore]}
                allowDecimals={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke={primary}
                strokeWidth={3}
                dot={({ cx, cy, payload }) => (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={primary}
                    stroke="#fff"
                    strokeWidth={1}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDotClick(payload)}
                  />
                )}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* ✅ 날짜별 상세 모달 */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 480,
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 2,
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selectedDateKey
                ? dayjs(selectedDateKey).format("YYYY-MM-DD")
                : "선택된 날짜 없음"}
            </Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {selectedDiaries.length > 0 ? (
            selectedDiaries.map((diary) => {
              const moodData = diary.mood ? moodIcons[diary.mood] : null;
              return (
                <Card
                  key={diary.id}
                  sx={{ mb: 1.5, borderRadius: 2, boxShadow: 1 }}
                >
                  <CardContent sx={{ display: "flex", gap: 2 }}>
                    {moodData?.color ? (
                      <Box
                        sx={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={moodData.color}
                          alt={diary.mood}
                          style={{ width: 48, height: 48 }}
                        />
                      </Box>
                    ) : null}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {diary.content?.length > 120
                          ? diary.content.slice(0, 120) + "..."
                          : diary.content || "내용이 없습니다."}
                      </Typography>
                      {diary.score != null && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          기분 점수: {diary.score}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Typography>이 날짜에는 작성된 일기가 없습니다.</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
