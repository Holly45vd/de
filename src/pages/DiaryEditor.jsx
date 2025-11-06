// src/pages/DiaryEditor.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Stack,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { moodIcons } from "../context/moodIcons";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// 기분 점수 아이콘
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

// 안전한 Date 변환 유틸 (없으면 간단 버전 포함)
const toSafeDate = (v) => {
  if (!v) return null;
  try {
    if (typeof v?.toDate === "function") return v.toDate(); // Firestore Timestamp
    if (v instanceof Date) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const scoreIcons = [
  { gray: faFaceSadTear, color: fasFaceSadTear, label: "매우 나쁨" },
  { gray: faFaceTired, color: fasFaceTired, label: "나쁨" },
  { gray: faFaceMeh, color: fasFaceMeh, label: "보통" },
  { gray: faFaceSmileWink, color: fasFaceSmileWink, label: "좋음" },
  { gray: faFaceLaughBeam, color: fasFaceLaughBeam, label: "매우 좋음" },
];

export default function DiaryEditor() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [mood, setMood] = useState("");
  const [score, setScore] = useState(3);
  const [content, setContent] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState("");
  const [hoveredMood, setHoveredMood] = useState(null);

  // 수정 모드: 기존 데이터 로드
  useEffect(() => {
    const fetchDiary = async () => {
      if (!id) return;
      try {
        const ref = doc(db, "diaries", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const d = toSafeDate(data.date) || new Date();
          setDate(dayjs(d).format("YYYY-MM-DD"));
          setMood(data.mood ?? "");
          setScore(Number(data.score) || 3);
          setContent(data.content ?? "");
        }
      } catch (error) {
        console.error("기존 일기 불러오기 실패:", error);
      }
    };
    fetchDiary();
  }, [id]);

  // 감정 선택 시 추천 문구 로드
  useEffect(() => {
    const fetchQuotes = async () => {
      if (!mood) return;
      try {
        const snap = await getDoc(doc(db, "moodQuotes", mood));
        setQuotes(snap.exists() ? snap.data().quotes || [] : []);
      } catch (error) {
        console.error("추천 문구 불러오기 실패:", error);
        setQuotes([]);
      }
    };
    fetchQuotes();
  }, [mood]);

  // 저장
  const handleSave = async () => {
    if (!content.trim() || !mood || !score) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (!currentUser?.uid) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      if (id) {
        await updateDoc(doc(db, "diaries", id), {
          userId: currentUser.uid,
          date: dayjs(date).toDate(), // 사용자가 선택한 날짜
          mood,
          score,
          content,
          updatedAt: serverTimestamp(),
        });
        alert("일기가 수정되었습니다.");
      } else {
        await addDoc(collection(db, "diaries"), {
          userId: currentUser.uid,
          date: dayjs(date).toDate(), // 기본: 오늘로 세팅
          mood,
          score,
          content,
          createdAt: serverTimestamp(),
        });
        alert("일기가 저장되었습니다.");
      }
      navigate("/calendar");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 추천 문구 본문에 추가
  const handleInsertQuote = (quote) => {
    setContent((prev) => (prev ? prev + "\n" + quote : quote));
    setSelectedQuote("");
  };

  const primary = theme.palette.primary.main;
  const tileHoverShadow = theme.shadows[3];
  const tileBorderSelected = `2px solid ${primary}`;
  const tileBorder = `1px solid ${alpha(theme.palette.text.primary, 0.16)}`;

  return (
    <div className="container">
      <Box>
        <Typography variant="h5" mb={3} textAlign="center" sx={{ fontWeight: 800 }}>
          {id ? "일기 수정" : "새 일기 작성"}
        </Typography>

        {/* 날짜 입력 */}
        <TextField
          type="date"
          label="날짜"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />

        {/* 오늘의 기분 선택 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" mb={2} textAlign="center" sx={{ fontWeight: 700 }}>
            오늘의 기분
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            {Object.keys(moodIcons).map((key) => {
              const iconData = moodIcons[key];
              const isSelected = mood === key;
              const isHovered = hoveredMood === key;

              return (
                <Grid
                  item
                  key={key}
                  xs={4}
                  sm={3}
                  md={2}
                  sx={{ textAlign: "center" }}
                >
                  <Box
                    onMouseEnter={() => setHoveredMood(key)}
                    onMouseLeave={() => setHoveredMood(null)}
                    onClick={() => setMood(key)}
                    sx={{
                      cursor: "pointer",
                      textAlign: "center",
                      mx: "auto",
                      width: "100%",
                      maxWidth: 120,
                      p: 1,
                      borderRadius: 2,
                      border: isSelected ? tileBorderSelected : tileBorder,
                      transition: "0.25s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: tileHoverShadow,
                      },
                      background:
                        isSelected ? alpha(primary, 0.06) : "transparent",
                    }}
                  >
                    <img
                      src={isSelected || isHovered ? iconData.color : iconData.gray}
                      alt={iconData.en}
                      style={{
                        width: 88,
                        height: 88,
                        margin: "0 auto 8px",
                        display: "block",
                        transition: "0.25s",
                        filter: isSelected ? "none" : "grayscale(0.05)",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.85rem",
                        color: isSelected ? "primary.main" : "text.primary",
                        fontWeight: isSelected ? 700 : 400,
                        lineHeight: 1.2,
                      }}
                    >
                      {iconData.en}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.8rem",
                        color: isSelected ? "primary.main" : "text.secondary",
                        display: "block",
                        lineHeight: 1.1,
                      }}
                    >
                      {iconData.ko}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* 오늘의 기분 점수 선택 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" mb={2} textAlign="center" sx={{ fontWeight: 700 }}>
            오늘의 기분 점수
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {scoreIcons.map((item, index) => {
              const isSelected = score === index + 1;
              return (
                <Box
                  key={index}
                  onClick={() => setScore(index + 1)}
                  sx={{
                    cursor: "pointer",
                    textAlign: "center",
                    border: isSelected ? tileBorderSelected : tileBorder,
                    borderRadius: 2,
                    p: 1,
                    width: 80,
                    transition: "0.25s",
                    "&:hover": {
                      borderColor: primary,
                      transform: "translateY(-3px)",
                      boxShadow: tileHoverShadow,
                    },
                    background: isSelected ? alpha(primary, 0.06) : "transparent",
                  }}
                >
                  <FontAwesomeIcon
                    icon={isSelected ? item.color : item.gray}
                    size="2x"
                    style={{
                      color: isSelected ? primary : "#999",
                      transition: "0.2s",
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* 추천 문구 */}
        <Box sx={{ mb: 3 }}>
          {quotes.length > 0 ? (
            <TextField
              select
              value={selectedQuote}
              onChange={(e) => handleInsertQuote(e.target.value)}
              fullWidth
              SelectProps={{
                displayEmpty: true,
                MenuProps: { PaperProps: { style: { maxHeight: 220 } } },
              }}
              placeholder="추천문구를 선택하면 일기 내용에 포함됩니다."
              sx={{ mb: 1 }}
            >
              <MenuItem value="" disabled>
                추천문구를 선택하면 일기 내용에 포함됩니다.
              </MenuItem>
              {quotes.map((quote, index) => (
                <MenuItem key={index} value={quote}>
                  {quote}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              추천 문구가 없습니다.
            </Typography>
          )}
        </Box>

        {/* 본문 입력 */}
        <TextField
          label="일기 내용"
          multiline
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* 저장 / 취소 */}
        <Stack
          direction={{ xs: "row", sm: "row" }}
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => navigate("/calendar")}
          >
            취소
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSave}
          >
            저장
          </Button>
        </Stack>
      </Box>
    </div>
  );
}
