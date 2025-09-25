// src/components/Recent30DaysChart.jsx
import React, { useEffect, useState } from "react";
import { moodIcons } from "../context/moodIcons";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function Recent30DaysChart() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);

  // 모달 상태
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [diaryDetails, setDiaryDetails] = useState([]);

  /** ✅ 최근 30일 데이터 불러오기 */
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchData = async () => {
      try {
        const today = dayjs();
        const startDate = today.subtract(30, "day").startOf("day");

        const q = query(
          collection(db, "diaries"),
          where("userId", "==", currentUser.uid)
        );

        const snap = await getDocs(q);
        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 최근 30일만 필터링
        const filtered = items.filter((item) => {
          const date = dayjs(item.date.toDate());
          return date.isAfter(startDate) && date.isBefore(today.add(1, "day"));
        });

        // 그래프용 포맷
        const formatted = filtered.map((item) => ({
          date: dayjs(item.date.toDate()).format("YYYY-MM-DD"),
          score: item.score || 0,
        }));

        // 날짜순 정렬
        formatted.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

        setChartData(formatted);
      } catch (error) {
        console.error("최근 30일 데이터 불러오기 실패:", error);
      }
    };

    fetchData();
  }, [currentUser]);

  /** ✅ 특정 날짜 점 클릭 → 해당 날짜의 일기 불러오기 */
  const handleDotClick = async (clickedDate) => {
    if (!currentUser?.uid) return;

    try {
      const q = query(
        collection(db, "diaries"),
        where("userId", "==", currentUser.uid)
      );

      const snap = await getDocs(q);
      const filtered = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => {
          const itemDate = dayjs(item.date.toDate()).format("YYYY-MM-DD");
          return itemDate === clickedDate;
        });

      setDiaryDetails(filtered);
      setSelectedDate(clickedDate);
      setOpen(true);
    } catch (error) {
      console.error("해당 날짜의 일기 불러오기 실패:", error);
    }
  };

  /** ✅ 일기 클릭 시 상세 페이지로 이동 */
  const handleDiaryClick = (id) => {
    setOpen(false); // 모달 닫기
    navigate(`/diary/${id}`); // 상세 페이지 이동
  };

  return (
    <Box
      sx={{
        mt: 5,
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
        boxShadow: 2,
      }}
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              label={{
                value: "날짜",
                position: "insideBottomRight",
                offset: -5,
              }}
            />
            <YAxis
              domain={[0, Math.max(...chartData.map((item) => item.score), 5)]}
              allowDecimals={false}
              label={{
                value: "점수",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#45C4B0"
              strokeWidth={3}
              dot={({ payload, cx, cy }) => (
                <g>
                  {/* 실제 보이는 점 */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={8}
                    fill="#45C4B0"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  {/* 클릭만 담당하는 투명 점 */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={14} // 클릭 영역 확장
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDotClick(payload.date)}
                  />
                </g>
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Typography color="textSecondary" textAlign="center" mt={3}>
          최근 30일 동안 작성된 일기가 없습니다.
        </Typography>
      )}

      {/* ===== 모달 ===== */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {/* 모달 헤더 */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">{selectedDate}</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 일기 상세 내용 */}
          {diaryDetails.length > 0 ? (
            diaryDetails.map((diary) => (
              <Card
                key={diary.id}
                sx={{
                  mb: 2,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#e0f7f5" },
                }}
                onClick={() => handleDiaryClick(diary.id)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {/* 기분 아이콘 */}
                    <img
                      src={moodIcons[diary.mood]?.color}
                      alt={diary.mood}
                      style={{ width: 30, height: 30 }}
                    />
                    {/* 내용 20자 제한 */}
                    <Typography
                      variant="body2"
                      sx={{ color: "#555", flex: 1 }}
                    >
                      {diary.content.length > 20
                        ? `${diary.content.slice(0, 20)}...`
                        : diary.content}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>이 날짜에는 작성된 일기가 없습니다.</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
