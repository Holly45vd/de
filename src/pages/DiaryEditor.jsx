// src/pages/DiaryEditor.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
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

// ===== 기분 점수 아이콘 =====
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

export default function DiaryEditor() {
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

  /** 수정 모드 시 기존 데이터 불러오기 */
  useEffect(() => {
    const fetchDiary = async () => {
      if (!id) return;
      try {
        const ref = doc(db, "diaries", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setDate(dayjs(data.date.toDate()).format("YYYY-MM-DD"));
          setMood(data.mood);
          setScore(data.score);
          setContent(data.content);
        }
      } catch (error) {
        console.error("기존 일기 불러오기 실패:", error);
      }
    };
    fetchDiary();
  }, [id]);

  /** 감정 선택 시 Firestore에서 추천 문구 불러오기 */
  useEffect(() => {
    const fetchQuotes = async () => {
      if (!mood) return;
      try {
        console.log("선택된 mood key:", mood); // key 로그 확인

        const snap = await getDoc(doc(db, "moodQuotes", mood));
        if (snap.exists()) {
          setQuotes(snap.data().quotes || []);
        } else {
          console.error(`Firestore 문서가 존재하지 않음 → key: ${mood}`);
          setQuotes([]);
        }
      } catch (error) {
        console.error("추천 문구 불러오기 실패:", error);
        setQuotes([]);
      }
    };
    fetchQuotes();
  }, [mood]);

  /** 저장 */
  const handleSave = async () => {
    if (!content.trim() || !mood || !score) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    try {
      if (id) {
        await updateDoc(doc(db, "diaries", id), {
          date: dayjs(date).toDate(),
          mood,
          score,
          content,
          updatedAt: serverTimestamp(),
        });
        alert("일기가 수정되었습니다.");
      } else {
        await addDoc(collection(db, "diaries"), {
          userId: currentUser.uid,
          date: dayjs(date).toDate(),
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
    }
  };

  /** 추천 문구 본문에 추가 */
  const handleInsertQuote = (quote) => {
    setContent((prev) => prev + "\n" + quote);
    setSelectedQuote("");
  };

  return (
    <div className="container">
      <Box>
        <Typography variant="h5" mb={3} textAlign="center">
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
        />

        {/* 오늘의 기분 선택 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" mb={2} textAlign="center">
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
                  xs={4} // 모바일: 3개
                  sm={4}
                  md={2.4} // PC: 5개
                  sx={{ textAlign: "center" }}
                >
                  <Box
                    onMouseEnter={() => setHoveredMood(key)}
                    onMouseLeave={() => setHoveredMood(null)}
                    onClick={() => setMood(key)}
                    sx={{
                      cursor: "pointer",
                      textAlign: "center",
                      margin: "0 auto",
                      width: "100%",
                      maxWidth: 110,
                      p: 1,
                      borderRadius: "var(--border-radius)",
                      border: "none",
                      boxShadow: "none",
                      transition: "0.3s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    <img
                      src={isSelected || isHovered ? iconData.color : iconData.gray}
                      alt={iconData.en}
                      style={{
                        width: 90,
                        height: 90,
                        margin: "0 auto 8px",
                        display: "block",
                        transition: "0.3s",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.85rem",
                        color: isSelected ? "var(--color-primary)" : "#333",
                        fontWeight: isSelected ? "bold" : "normal",
                        lineHeight: 1.2,
                      }}
                    >
                      {iconData.en}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.8rem",
                        color: isSelected ? "var(--color-primary)" : "#666",
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
          <Typography variant="subtitle1" mb={2} textAlign="center">
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
                    border: isSelected
                      ? "2px solid var(--color-primary)"
                      : "1px solid #ccc",
                    borderRadius: "var(--border-radius)",
                    p: 1,
                    width: 80,
                    transition: "0.3s",
                    "&:hover": {
                      borderColor: "var(--color-primary)",
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  <FontAwesomeIcon
                    icon={isSelected ? item.color : item.gray}
                    size="2x"
                    style={{
                      color: isSelected ? "var(--color-primary)" : "#ccc",
                      transition: "0.3s",
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
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                },
              }}
              placeholder="추천문구를 선택하면 일기 내용에 포함됩니다."
              sx={{
                mb: 1,
                "& .MuiSelect-select": {
                  color: selectedQuote ? "#000" : "#888",
                },
              }}
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
            <Typography
              variant="body2"
              color="textSecondary"
              textAlign="center"
            >
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
          sx={{ mb: 3 }}
        />

        {/* 저장 및 취소 버튼 */}
      {/* 저장 및 취소 버튼 */}
<Box
  sx={{
    display: "flex",
    gap: 2,
    mt: 3,
    flexDirection: { xs: "row", sm: "row" }, // 모바일과 동일하게 가로배치
    justifyContent: "space-between",
  }}
>
  {/* 취소 버튼 */}
  <Button
    variant="outlined"
    onClick={() => navigate("/calendar")}
    sx={{
      flex: 1, // 버튼이 동일 비율로 늘어남
      fontSize: { xs: "1rem", sm: "0.9rem" },
      height: 48,
      borderColor: "#45C4B0",
      color: "#45C4B0",
      "&:hover": {
        borderColor: "#3ab3a1",
        backgroundColor: "rgba(69,196,176,0.05)",
      },
    }}
  >
    취소
  </Button>

  {/* 저장 버튼 */}
  <Button
    variant="contained"
    onClick={handleSave}
    sx={{
      flex: 1,
      fontSize: { xs: "1rem", sm: "0.9rem" },
      height: 48,
      backgroundColor: "#45C4B0",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#3ab3a1",
      },
    }}
  >
    저장
  </Button>
</Box>

      </Box>
    </div>
  );
}
