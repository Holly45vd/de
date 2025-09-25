import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { moodIcons } from "../context/moodIcons";
import LoadingSpinner from "../components/LoadingSpinner";
import TodayStatus from "../components/TodayStatus";
import WeeklyStatus from "../components/WeeklyStatus";
import MonthlyChart from "../components/MonthlyChart";
import dayjs from "dayjs";

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [diaries, setDiaries] = useState([]); // 전체 일기 데이터
  const [loading, setLoading] = useState(true);

  /** ===== Firestore에서 일기 불러오기 ===== */
  useEffect(() => {
    const fetchDiaries = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "diaries"), where("userId", "==", currentUser.uid));
        const snap = await getDocs(q);

        const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // 최신순 정렬 (최근 작성된 일기가 가장 위로)
        items.sort((a, b) => {
          const ta = a.date?.toDate ? a.date.toDate().getTime() : 0;
          const tb = b.date?.toDate ? b.date.toDate().getTime() : 0;
          return tb - ta;
        });

        setDiaries(items);
      } catch (error) {
        console.error("일기 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [currentUser]);

  if (loading) return <LoadingSpinner />;

  /** ===== 오늘의 일기 데이터 추출 ===== */
  const todayKey = dayjs().format("YYYY-MM-DD");
  const todayDiary = diaries.find(
    (diary) => dayjs(diary.date.toDate()).format("YYYY-MM-DD") === todayKey
  );

  /** ===== 최근 4개의 일기만 가져오기 ===== */
  const recentDiaries = diaries.slice(0, 4);

  return (
    <Box sx={{ mt: 3, p: 3 }}>
      {/* === 오늘의 일기 === */}
      <Box sx={{ mb: 5 }}>
        <TodayStatus todayDiary={todayDiary} />
      </Box>

      {/* === 주간 체크라인 === */}
      <WeeklyStatus />

      {/* === 이번 달 기분 점수 그래프 === */}
      <MonthlyChart />

{/* === 최근 나의 일기 === */}
<Typography
  variant="h5"
  mb={3}
  sx={{ mt: 5, fontWeight: "bold", color: "#45C4B0" }}
>
  최근 나의 일기
</Typography>

{recentDiaries.length > 0 ? (
  <Grid container spacing={3}>
    {recentDiaries.map((diary) => {
      const contentPreview =
        diary.content.length > 12
          ? diary.content.slice(0, 12) + "..."
          : diary.content;

      return (
        <Grid item xs={12} sm={6} md={4} key={diary.id}>
          <Card
            onClick={() => navigate(`/diary/${diary.id}`)}
            sx={{
              width: "100%",
              minHeight: 140,
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: 1,
              cursor: "pointer",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
                backgroundColor: "#f0faf8",
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 2,
              }}
            >
              {/* === 상단: 아이콘 왼쪽 / 날짜 오른쪽 === */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                {/* 아이콘 (왼쪽) */}
                {moodIcons[diary.mood]?.color ? (
                  <img
                    src={moodIcons[diary.mood].color}
                    alt={diary.mood}
                    width={40}
                    height={40}
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <Typography fontSize={30}>📝</Typography>
                )}

                {/* 날짜 (오른쪽) */}
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#666", fontSize: "0.8rem" }}
                >
                  {dayjs(diary.date?.toDate()).format("YYYY.MM.DD")}
                </Typography>
              </Box>

              {/* === 내용 미리보기 (12자 제한) === */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.9rem",
                  color: "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                {contentPreview || "내용이 없습니다."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      );
    })}
  </Grid>
) : (
  <Typography color="textSecondary" textAlign="center" mt={3}>
    아직 작성된 일기가 없습니다.
  </Typography>
)}


    </Box>
  );
}
