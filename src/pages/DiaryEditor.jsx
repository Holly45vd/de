import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, updateDoc, doc, getDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { moodIcons } from "../context/moodIcons";

// ✅ Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFaceSadTear,
  faFaceTired,
  faFaceMeh,
  faFaceSmileWink,
  faFaceLaughBeam
} from "@fortawesome/free-regular-svg-icons"; // 회색 아이콘

import {
  faFaceSadTear as fasFaceSadTear,
  faFaceTired as fasFaceTired,
  faFaceMeh as fasFaceMeh,
  faFaceSmileWink as fasFaceSmileWink,
  faFaceLaughBeam as fasFaceLaughBeam
} from "@fortawesome/free-solid-svg-icons"; // 컬러 아이콘

export default function DiaryEditor() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { id } = useParams();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState(""); // 선택된 감정
  const [hoveredMood, setHoveredMood] = useState(""); // hover 상태
  const [score, setScore] = useState(3); // 선택된 점수
  const [hoveredScore, setHoveredScore] = useState(null); // hover 중인 점수
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // ✅ 점수 아이콘 정의 (회색 vs 컬러)
  const scoreIcons = [
    { gray: faFaceSadTear, color: fasFaceSadTear, label: "매우 나쁨" },
    { gray: faFaceTired, color: fasFaceTired, label: "나쁨" },
    { gray: faFaceMeh, color: fasFaceMeh, label: "보통" },
    { gray: faFaceSmileWink, color: fasFaceSmileWink, label: "좋음" },
    { gray: faFaceLaughBeam, color: fasFaceLaughBeam, label: "매우 좋음" },
  ];

  // ✅ 수정 모드일 경우 기존 데이터 불러오기
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

  // ✅ 유효성 검사
  const isFormValid = () => {
    return (
      selectedDate && content.trim() !== "" && mood.trim() !== "" && score > 0
    );
  };

  // ✅ 저장
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
        style={{ width: "100%" }}
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
              onClick={() => setMood(key)}
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
                style={{
                  objectFit: "contain",
                  display: "block",
                  transition: "0.3s ease",
                }}
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
                {key.split(" ")[1]}
              </Typography>
            </Box>
          );
        })}
      </Box>

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

      {/* 점수 선택 (아이콘 클릭) */}
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
    backgroundColor: "#45C4B0", // 기본 민트색
    color: "#fff",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#3ab3a1", // hover 시 조금 진한 민트
    },
  }}
>
  {id ? "수정하기" : "저장하기"}
</Button>
    </div>
  );
}
