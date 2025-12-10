// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  useMediaQuery,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
import { getDailyHappinessQuote } from "../utils/happinessQuote";

export default function HomePage() {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 행복 명언 상태
  const [quote, setQuote] = useState(null);
  const [quotePopupOpen, setQuotePopupOpen] = useState(false);

  const todayKey = dayjs().format("YYYY-MM-DD");

  /** =======================
   *   1) 행복 명언 불러오기
   * ======================= */
  useEffect(() => {
    let closedToday = false;

    const closedInfo = localStorage.getItem("quote_popup_closed");
    if (closedInfo) {
      try {
        const parsed = JSON.parse(closedInfo);
        if (parsed.date === todayKey && parsed.closed) {
          closedToday = true;
        }
      } catch {
        // 파싱 실패 시 무시
      }
    }

    const fetchQuote = async () => {
      const result = await getDailyHappinessQuote();
      if (result) {
        setQuote(result);
        // 오늘 안 닫았을 때만 자동 팝업
        if (!closedToday) {
          setQuotePopupOpen(true);
        }
      }
    };

    fetchQuote();
  }, [todayKey]);

  const handleCloseQuotePopup = () => {
    setQuotePopupOpen(false);
    localStorage.setItem(
      "quote_popup_closed",
      JSON.stringify({ date: todayKey, closed: true })
    );
  };

  // 🔹 X로 닫은 후에도 다시 보기
  const reopenQuotePopup = () => {
    if (quote) {
      setQuotePopupOpen(true);
    }
  };

  /** =======================
   *   2) Firestore에서 일기 불러오기
   * ======================= */
  useEffect(() => {
    const fetchDiaries = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
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
            (a, b) =>
              (b.date?.getTime?.() || -1) - (a.date?.getTime?.() || -1)
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

  const todayDiary = diaries.find(
    (diary) =>
      diary.date && dayjs(diary.date).format("YYYY-MM-DD") === todayKey
  );
  const recentDiaries = diaries.slice(0, 6);

  const primary = theme.palette.primary.main;
  const cardHoverBg = alpha(primary, 0.06);
  const overlayBg = "rgba(0,0,0,0.72)";

  return (
    <div className="container">
      {/* 🔹 오늘의 명언 다시 보기 버튼 (항상 표시, 명언 있을 때만 활성) */}
      <Box
        sx={{
          mt: 2,
          mb: 1,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={reopenQuotePopup}
          disabled={!quote}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 600,
            borderColor: primary,
            color: primary,
            px: 2,
            py: 0.5,
            fontSize: "0.8rem",
          }}
        >
          오늘의 명언 보기
        </Button>
      </Box>

      {/* 🔹 상단 행복 명언 팝업 (애니메이션 + 카드 스타일) */}
      <Slide
        in={quotePopupOpen && !!quote}
        direction="down"
        mountOnEnter
        unmountOnExit
      >
        <Box
          sx={{
            mt: 1,
            mb: 2,
            p: 2.2,
            borderRadius: 3,
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            background: theme.palette.background.paper,
            border: `1px solid ${alpha(primary, 0.25)}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 좌측 컬러 라인 */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 5,
              bgcolor: primary,
            }}
          />
          {/* 우측 상단 큰 따옴표 */}
          <Box
            sx={{
              position: "absolute",
              right: 12,
              top: -4,
              fontSize: 54,
              fontWeight: 700,
              color: alpha(primary, 0.15),
              pointerEvents: "none",
            }}
          >
            ”
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 0.5,
              pr: 0.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                letterSpacing: 0.3,
                color: primary,
              }}
            >
              오늘의 행복 한 줄
            </Typography>

            <IconButton
              size="small"
              onClick={handleCloseQuotePopup}
              sx={{
                color: alpha("#000", 0.6),
                "&:hover": {
                  bgcolor: alpha("#000", 0.08),
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* 명언 본문 */}
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-line",
              mb: 1,
              color: "#333",
              fontWeight: 500,
              lineHeight: 1.7,
            }}
          >
            {quote?.content}
          </Typography>

          {/* 저자 */}
          {quote?.author && (
            <Typography
              variant="caption"
              sx={{
                color: "#666",
                fontStyle: "italic",
              }}
            >
              — {quote.author}
            </Typography>
          )}
        </Box>
      </Slide>

      <Box sx={{ mt: 3 }}>
        {/* 오늘의 일기 */}
        <Box sx={{ mb: 5 }}>
          <TodayStatus todayDiary={todayDiary} />
        </Box>

        {/* 주간 체크라인 */}
        <WeeklyStatus diaries={diaries} />

        {/* 최근 30일 기분 점수 그래프 */}
        <MonthlyChart diaries={diaries} />

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
                        transition:
                          "opacity .25s ease, transform .25s ease",
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
