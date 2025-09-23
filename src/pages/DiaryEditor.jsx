// src/pages/DiaryEditor.jsx
import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Slider, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, updateDoc, doc, getDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { moodIcons } from "../context/moodIcons";

const moods = Object.keys(moodIcons).map((key) => ({
  value: key,
  label: `${moodIcons[key]} ${key}`,
}));

export default function DiaryEditor() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { id } = useParams();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState("sunny");
  const [score, setScore] = useState(5);
  const [selectedDate, setSelectedDate] = useState(dayjs());

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
          setMood(data.mood || "sunny");
          setScore(data.score || 5);
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
          mood,
          score,
          date: formattedDate,
          updatedAt: new Date(),
        });
        alert("일기가 수정되었습니다!");
      } else {
        await addDoc(collection(db, "diaries"), {
          content,
          mood,
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

      {/* 감정 선택 */}
      <TextField
        select
        label="오늘의 감정"
        fullWidth
        margin="normal"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      >
        {moods.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>

      {/* 기분 점수 */}
      <Typography variant="subtitle1" style={{ marginTop: "20px" }}>
        오늘의 기분 점수: {score}
      </Typography>
      <Slider
        value={score}
        onChange={(e, newValue) => setScore(newValue)}
        step={1}
        marks
        min={1}
        max={10}
        valueLabelDisplay="auto"
        style={{ marginTop: "10px" }}
      />

      {/* 저장 버튼 */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSave}
        style={{ marginTop: "20px" }}
        disabled={!isFormValid()}
      >
        {id ? "수정하기" : "저장하기"}
      </Button>
    </div>
  );
}
