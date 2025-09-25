import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Collapse,
  IconButton,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  updateDoc,
  doc,
  getDoc,
  collection,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { moodIcons } from "../context/moodIcons";
import { moodKeyMapper } from "../context/moodKeyMapper"; // ✅ 한글 → 영어 매핑

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

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

export default function DiaryEditor() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { id } = useParams();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState(""); // 한글 감정
  const [hoveredMood, setHoveredMood] = useState("");
  const [score, setScore] = useState(3);
  const [hoveredScore, setHoveredScore] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Firestore 추천 문구 상태
  const [quotes, setQuotes] = useState([]);
  const [randomQuote, setRandomQuote] = useState("");
  const [showQuotes, setShowQuotes] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");

  // mood가 변경되면 드롭다운 초기화
  useEffect(() => {
    setSelectedQuote("");
    setShowQuotes(false);
  }, [mood]);

  // 점수 아이콘 정의
  const scoreIcons = [
    { gray: faFaceSadTear, color: fasFaceSadTear, label: "매우 나쁨" },
    { gray: faFaceTired, color: fasFaceTired, label: "나쁨" },
    { gray: faFaceMeh, color: fasFaceMeh, label: "보통" },
    { gray: faFaceSmileWink, color: fasFaceSmileWink, label: "좋음" },
    { gray: faFaceLaughBeam, color: fasFaceLaughBeam, label: "매우 좋음" },
  ];

  /** ✅ 수정 모드일 경우 기존 데이터 불러오기 */
  useEffect(() => {
    const fetchDiary = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "diaries", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setContent(data.content || "");
          setMood(data.mood || "");
          setScore(data.score || 3);
          setSelectedDate(
            data.date?.toDate ? dayjs(data.date.toDate()) : dayjs()
          );
        } else {
          alert("해당 일기를 찾을 수 없습니다.");
          navigate("/home");
        }
      } catch (error) {
        console.error("일기 불러오기 실패:", error);
      }
    };

    fetchDiary();
  }, [id, navigate]);

  /** ✅ Firestore에서 moodQuotes 가져오기 */
  useEffect(() => {
    const fetchQuotes = async () => {
      if (!mood) {
        setQuotes([]);
        setRandomQuote("");
        return;
      }

      try {
        // 🔹 한글만 추출
        const cleanMood = mood.replace(/[a-zA-Z]/g, "").trim();

        // 🔹 moodKeyMapper에서 영문 키 찾기
        const moodKey = moodKeyMapper[cleanMood];
        console.log("매핑된 Firestore 문서 ID:", moodKey);

        if (!moodKey) {
          console.error("moodKeyMapper에 없는 값입니다:", cleanMood);
          return;
        }

        // Firestore 문서 직접 조회
        const moodDocRef = doc(db, "moodQuotes", moodKey);
        const moodDocSnap = await getDoc(moodDocRef);

        if (!moodDocSnap.exists()) {
          console.warn("해당 mood 문서를 찾을 수 없습니다:", moodKey);
          return;
        }

        const data = moodDocSnap.data();

        if (Array.isArray(data.quotes)) {
          setQuotes(data.quotes);

          // 랜덤 문구 선택
          const randomIndex = Math.floor(Math.random() * data.quotes.length);
          setRandomQuote(data.quotes[randomIndex]);
        } else {
          console.error("quotes가 배열이 아닙니다:", data.quotes);
        }
      } catch (error) {
        console.error("문구 불러오기 실패:", error);
      }
    };

    fetchQuotes();
  }, [mood]);

  /** ✅ 문구 클릭 시 내용에 추가 */
  const handleQuoteClick = (quote) => {
    setContent((prev) => (prev ? prev + "\n" + quote : quote));
    setSelectedQuote(quote); // 선택 문구 헤더 표시
    setQuoteMessage("문구가 내용에 추가되었습니다.");
    setShowQuotes(false);

    setTimeout(() => setQuoteMessage(""), 2000); // 2초 후 메시지 숨김
  };

  /** 유효성 검사 */
  const isFormValid = () => {
    return (
      selectedDate && content.trim() !== "" && mood.trim() !== "" && score > 0
    );
  };

  /** ✅ 일기 저장 */
  const handleSave = async () => {
    if (!currentUser) return alert("로그인 후 이용해주세요.");
    if (!isFormValid()) return alert("모든 항목을 입력해주세요.");

    try {
      const formattedDate = selectedDate.toDate();

      if (id) {
        await updateDoc(doc(db, "diaries", id), {
          content,
          mood: String(mood),
          score,
          date: formattedDate,
          updatedAt: new Date(),
        });
        alert("일기가 수정되었습니다!");
      } else {
        await addDoc(collection(db, "diaries"), {
          content,
          mood: String(mood),
          score,
          date: formattedDate,
          userId: currentUser.uid,
        });
        alert("새 일기가 저장되었습니다!");
      }

      navigate("/home");
    } catch (error) {
      console.error("일기 저장 실패:", error);
    }
  };

  return (
    <div
      style={{
        paddingTop: "80px",
        padding: "20px",
        textAlign: "center",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <Typography variant="h5" style={{ marginBottom: "20px" }}>
        {id ? "일기 수정" : "새 일기 쓰기"}
      </Typography>

      {/* 날짜 선택 */}
      <DatePicker
        label="날짜 선택"
        value={selectedDate}
        onChange={(newValue) => setSelectedDate(newValue)}
        format="YYYY-MM-DD"
        slotProps={{ textField: { fullWidth: true } }}
      />

      {/* 감정 선택 */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 3,
          mt: 4,
          mb: 3,
        }}
      >
        {Object.entries(moodIcons).map(([key, icons]) => {
          const isSelected = mood === key;
          const isHovered = hoveredMood === key;

          return (
            <Box
              key={key}
              onClick={() => setMood(key.trim())}
              onMouseEnter={() => setHoveredMood(key)}
              onMouseLeave={() => setHoveredMood("")}
              sx={{
                border: "none",
                borderRadius: "16px",
                padding: "8px",
                cursor: "pointer",
                transition: "transform 0.25s ease, box-shadow 0.3s ease",
                transform: isHovered || isSelected ? "scale(1.15)" : "scale(1)",
                boxShadow: isSelected
                  ? "0 4px 12px rgba(0, 0, 0, 0.25)"
                  : "none",
                "&:hover": {
                  transform: "scale(1.2)",
                },
              }}
            >
              <img
                src={isSelected || isHovered ? icons.color : icons.gray}
                alt={key}
                width={70}
                height={70}
              />
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  fontSize: "0.8rem",
                  display: "block",
                  color: isSelected ? "#45C4B0" : "#666",
                }}
              >
                {key}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* 추천 문구 영역 */}
      {mood && (
        <Box sx={{ mb: 3, textAlign: "left" }}>
          {/* 헤더: 드롭다운 토글 */}
          <Box
            onClick={() => setShowQuotes(!showQuotes)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <Typography variant="body2" sx={{ mr: 1 }}>
              {selectedQuote || "추천문구 : 문구를 클릭하면 내용에 쓰여집니다"}
            </Typography>
            <IconButton size="small">
              <FontAwesomeIcon icon={showQuotes ? faChevronUp : faChevronDown} />
            </IconButton>
          </Box>

          {/* 드롭다운 목록 */}
          <Collapse in={showQuotes}>
            <Box
              sx={{ mt: 1, p: 1, backgroundColor: "#fafafa", borderRadius: "8px" }}
            >
              {/* 첫 번째 추천문구 (랜덤) */}
              {randomQuote && (
                <Typography
                  onClick={() => handleQuoteClick(randomQuote)}
                  sx={{
                    p: 1,
                    mb: 0.5,
                    borderRadius: "6px",
                    backgroundColor: "#eaf7f5",
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#e0f7f5",
                      color: "#45C4B0",
                    },
                  }}
                >
                  ✨ 추천: {randomQuote}
                </Typography>
              )}

              {quotes.map((q, index) => (
                <Typography
                  key={index}
                  onClick={() => handleQuoteClick(q)}
                  sx={{
                    p: 1,
                    cursor: "pointer",
                    borderRadius: "6px",
                    "&:hover": {
                      backgroundColor: "#e0f7f5",
                      color: "#45C4B0",
                    },
                  }}
                >
                  {q}
                </Typography>
              ))}
            </Box>
          </Collapse>

          {quoteMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {quoteMessage}
            </Alert>
          )}
        </Box>
      )}

      {/* 일기 내용 */}
      <TextField
        label="내용"
        fullWidth
        multiline
        rows={6}
        margin="normal"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* 기분 점수 */}
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
        오늘의 기분 점수
      </Typography>

      {/* 점수 선택 */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 3 }}>
        {scoreIcons.map((icon, index) => {
          const value = index + 1;
          const isActive = value <= score;
          const isHovering = hoveredScore && value <= hoveredScore;

          return (
            <Box
              key={index}
              onClick={() => setScore(value)}
              onMouseEnter={() => setHoveredScore(value)}
              onMouseLeave={() => setHoveredScore(null)}
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s ease",
                transform: isHovering ? "scale(1.2)" : "scale(1)",
              }}
            >
              <FontAwesomeIcon
                icon={isActive || isHovering ? icon.color : icon.gray}
                style={{
                  fontSize: "40px",
                  color: isActive || isHovering ? "#45C4B0" : "#808080",
                  transition: "color 0.3s ease, transform 0.3s ease",
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* 저장 버튼 */}
      <Button
        fullWidth
        onClick={handleSave}
        disabled={!isFormValid()}
        sx={{
          mt: 3,
          backgroundColor: "#45C4B0",
          color: "#fff",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#3ab3a1",
          },
        }}
      >
        {id ? "수정하기" : "저장하기"}
      </Button>
    </div>
  );
}
