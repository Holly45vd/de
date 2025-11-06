// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { moodIcons } from "../context/moodIcons";
import LoadingSpinner from "../components/LoadingSpinner";
import TodayStatus from "../components/TodayStatus";
import WeeklyStatus from "../components/WeeklyStatus";
import MonthlyChart from "../components/MonthlyChart";
import dayjs from "dayjs";
import { normalizeDiary } from "../utils/firebaseHelpers";

export default function HomePage() {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  /** Firestore에서 일기 불러오기 (정규화 + 폴백 포함) */
  useEffect(() => {
    const fetchDiaries = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        // 권장 경로: 서버 정렬 + 제한
        const q = query(
          collection(db, "diaries"),
          where("userId", "==", currentUser.uid),
          orderBy("date", "desc"),
          limit(60)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((doc) =>
          normalizeDiary({ id: doc.id, ...doc.data() })
        );
        setDiaries(items);
      } catch (error) {
        console.error("일기 불러오기 실패(주 쿼리):", error);

        // 폴백: 인덱스 미구성/권한 문제 등으로 실패 시 클라이언트 정렬
        try {
          const snap2 = await getDocs(
            query(
              collection(db, "diaries"),
              where("userId", "==", currentUser.uid)
            )
          );
          const items2 = snap2.docs.map((doc) =>
            normalizeDiary({ id: doc.id, ...doc.data() })
          );
          items2.sort(
            (a, b) => (b.date?.getTime?.() || -1) - (a.date?.getTime?.() || -1)
          );
          setDiaries(items2);
        } catch (e2) {
          console.error("일기 불러오기 실패(폴백):", e2);
          setDiaries([]);
        }
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
    (diary) => diary.date && dayjs(diary.date).format("YYYY-MM-DD") === todayKey
  );

  /** 최근 6개의 일기 */
  const recentDiaries = diaries.slice(0, 6);

  const primary = theme.palette.primary.main;
  const cardHoverBg = alpha(primary, 0.06);
  const overlayBg = "rgba(0,0,0,0.72)";

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
          variant={isSm ? "h6" : "h5"}
          mb={3}
          sx={{ mt: 5, fontWeight: 800, color: "primary.main" }}
        >
          최근 나의 일기
        </Typography>

        {recentDiaries.length > 0 ? (
          <Grid container spacing={2}>
            {recentDiaries.map((diary) => {
              const d = diary.date || null;
              const contentPreview =
                diary.content?.length > 60
                  ? diary.content.slice(0, 60) + "..."
                  : diary.content || "";

              return (
                <Grid item xs={6} sm={4} md={2} key={diary.id}>
                  <Card
                    onClick={() => navigate(`/diary/${diary.id}`)}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      height: 200,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      overflow: "hidden",
                      borderRadius: 2,
                      boxShadow: theme.shadows[1],
                      transition: "all .25s ease",
                      background: `linear-gradient(180deg, ${alpha(
                        primary,
                        0.04
                      )}, transparent)`,
                      "&:hover": {
                        boxShadow: theme.shadows[4],
                        backgroundColor: cardHoverBg,
                      },
                      "&:hover .preview": {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* 큰 아이콘 */}
                      {moodIcons[diary.mood]?.color ? (
                        <img
                          src={moodIcons[diary.mood].color}
                          alt={diary.mood}
                          width={96}
                          height={86}
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <Typography fontSize={48}>📝</Typography>
                      )}

                      {/* 날짜 */}
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mt: 1,
                          color: "text.secondary",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                        }}
                      >
                        {d ? dayjs(d).format("MM.DD") : "-"}
                      </Typography>
                    </CardContent>

                    {/* 미리보기 오버레이 */}
                    <Box
                      className="preview"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        bgcolor: overlayBg,
                        color: "#fff",
                        p: 1,
                        opacity: 0,
                        transform: "translateY(100%)",
                        transition: "opacity .25s ease, transform .25s ease",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                        whiteSpace: "pre-line",
                        textAlign: "left",
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
          <Typography color="text.secondary" textAlign="center" mt={3}>
            아직 작성된 일기가 없습니다.
          </Typography>
        )}
      </Box>
    </div>
  );
}
