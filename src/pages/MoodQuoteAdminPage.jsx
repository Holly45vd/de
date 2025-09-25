// src/pages/MoodQuoteAdminPage.jsx
import React, { useState } from "react";
import { Box, Typography, TextField, Button, MenuItem } from "@mui/material";
import { db } from "../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const moods = [
  { id: "anxiety", label: "불안" },
  { id: "lethargy", label: "무기력" },
  { id: "coldness", label: "냉담" },
  { id: "lonely", label: "외로움" },
  { id: "calm", label: "평온" },
  { id: "sadness", label: "슬픔" },
  { id: "protection", label: "보호" },
  { id: "happiness", label: "행복" },
  { id: "hope", label: "희망" },
  { id: "growth", label: "성장" },
];

export default function MoodQuoteAdminPage() {
  const [selectedMood, setSelectedMood] = useState("");
  const [quotes, setQuotes] = useState([""]);

  // 문구 추가 입력창
  const addQuoteField = () => {
    setQuotes([...quotes, ""]);
  };

  // 문구 입력값 업데이트
  const handleQuoteChange = (index, value) => {
    const updatedQuotes = [...quotes];
    updatedQuotes[index] = value;
    setQuotes(updatedQuotes);
  };

  // Firestore 저장
  const handleSave = async () => {
    if (!selectedMood || quotes.length === 0 || !quotes[0].trim()) {
      alert("감정과 문구를 입력해주세요.");
      return;
    }

    try {
      await setDoc(doc(db, "moodQuotes", selectedMood), {
        mood: moods.find((m) => m.id === selectedMood).label,
        quotes: quotes.filter((q) => q.trim() !== ""), // 공백 제거
      });
      alert("데이터가 성공적으로 저장되었습니다!");
      setQuotes([""]); // 초기화
    } catch (error) {
      console.error("저장 실패:", error.message);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        감정 문구 입력 페이지
      </Typography>

      {/* 감정 선택 */}
      <TextField
        select
        label="감정 선택"
        value={selectedMood}
        onChange={(e) => setSelectedMood(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        {moods.map((mood) => (
          <MenuItem key={mood.id} value={mood.id}>
            {mood.label}
          </MenuItem>
        ))}
      </TextField>

      {/* 문구 입력 필드 */}
      {quotes.map((quote, index) => (
        <TextField
          key={index}
          label={`문구 ${index + 1}`}
          value={quote}
          onChange={(e) => handleQuoteChange(index, e.target.value)}
          fullWidth
          sx={{ mb: 1 }}
        />
      ))}

      <Button
        variant="outlined"
        onClick={addQuoteField}
        sx={{ mb: 2 }}
      >
        + 문구 추가
      </Button>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        fullWidth
        sx={{ backgroundColor: "#45C4B0", "&:hover": { backgroundColor: "#38a99a" } }}
      >
        Firestore에 저장
      </Button>
    </Box>
  );
}
