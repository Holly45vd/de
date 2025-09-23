// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { moodIcons } from "../context/moodIcons";
import LoadingSpinner from "../components/LoadingSpinner";

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiaries = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "diaries"),
          where("userId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 최신순 정렬
        items.sort((a, b) => {
          const ta = a.date?.toDate ? a.date.toDate().getTime() : 0;
          const tb = b.date?.toDate ? b.date.toDate().getTime() : 0;
          return tb - ta;
        });

        setDiaries(items);
      } catch (e) {
        console.error("일기 불러오기 실패:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [currentUser]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ mt: 10, p: 3 }}>
      <Typography variant="h5" mb={3}>
        최근 나의 일기
      </Typography>

      {diaries.length > 0 ? (
        <Grid container spacing={3}>
          {diaries.map((diary) => {
            const contentPreview =
              diary.content.length > 15
                ? diary.content.slice(0, 15) + "..."
                : diary.content;

            return (
              <Grid item xs={12} sm={6} md={4} key={diary.id}>
                <Card
                  onClick={() => navigate(`/diary/${diary.id}`)}
                  sx={{
                    width: 250, // 카드 가로 크기 고정
                    height: 180, // 카드 세로 크기 고정
                    backgroundColor: "#f9f9f9",
                    borderRadius: 2,
                    boxShadow: 2,
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {moodIcons[diary.mood] || "📝"}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {diary.date?.toDate().toLocaleDateString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        fontSize: "0.9rem",
                        color: "#333",
                      }}
                    >
                      {contentPreview}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      점수: {diary.score}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Typography>아직 작성된 일기가 없습니다.</Typography>
      )}
    </Box>
  );
}
