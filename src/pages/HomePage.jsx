// src/pages/HomePage.jsx
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

  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  /** Firestore에서 일기 불러오기 */
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

        // 최신순 정렬
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

  /** 오늘의 일기 */
  const todayKey = dayjs().format("YYYY-MM-DD");
  const todayDiary = diaries.find(
    (diary) => dayjs(diary.date.toDate()).format("YYYY-MM-DD") === todayKey
  );

  /** 최근 6개의 일기 */
  const recentDiaries = diaries.slice(0, 6);

  return (
    <div className="container">
      <Box sx={{ mt: 3 }}>
        {/* 오늘의 일기 */}
        <Box sx={{ mb: 5 }}>
          <TodayStatus todayDiary={todayDiary} />
        </Box>

        {/* 주간 체크라인 */}
        <WeeklyStatus />

        {/* 이번 달 기분 점수 그래프 */}
        <MonthlyChart />

        {/* 최근 나의 일기 */}
        <Typography
          variant="h5"
          mb={3}
          sx={{ mt: 5, fontWeight: "bold", color: "var(--color-primary)" }}
        >
          최근 나의 일기
        </Typography>

        {recentDiaries.length > 0 ? (
          <Grid container spacing={2}>
            {recentDiaries.map((diary) => {
              const contentPreview =
                diary.content.length > 30
                  ? diary.content.slice(0, 30) + "..."
                  : diary.content;

              return (
                <Grid item xs={6} sm={4} md={2} key={diary.id}>
                  <Card
                    className="card"
                    onClick={() => navigate(`/diary/${diary.id}`)}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      height: 180,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      overflow: "hidden",
                      borderRadius: 2,
                      "&:hover": { boxShadow: 6 },
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* 큰 아이콘 */}
                      {moodIcons[diary.mood]?.color ? (
                        <img
                          src={moodIcons[diary.mood].color}
                          alt={diary.mood}
                          width={100}
                          height={90}
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <Typography fontSize={40}>📝</Typography>
                      )}

                      {/* 날짜 */}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mt: 1,
                          color: "#666",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                        }}
                      >
                        {dayjs(diary.date?.toDate()).format("MM.DD")}
                      </Typography>
                    </CardContent>

                    {/* ===== 마우스 오버 시 내용 미리보기 ===== */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        bgcolor: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        p: 1,
                        opacity: 0,
                        transform: "translateY(100%)",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                        fontSize: "0.85rem",
                        lineHeight: 1.4,
                        whiteSpace: "pre-line",
                        "&:hover": {
                          opacity: 1,
                          transform: "translateY(0)",
                        },
                      }}
                    >
                      {contentPreview || "내용이 없습니다."}
                    </Box>
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
    </div>
  );
}
