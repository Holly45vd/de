// src/pages/DiaryDetail.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { moodIcons } from "../context/moodIcons";

export default function DiaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);

  useEffect(() => {
    const fetchDiary = async () => {
      const ref = doc(db, "diaries", id);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setDiary({ id: snapshot.id, ...snapshot.data() });
      }
    };
    fetchDiary();
  }, [id]);

  const handleDelete = async () => {
    await deleteDoc(doc(db, "diaries", id));
    navigate("/");
  };

  if (!diary) return <Typography>Loading...</Typography>;

  const moodIcon = diary?.mood ? moodIcons[diary.mood] || "❔" : "❔";

  return (
    <Box sx={{ p: 3 }}>
      {/* 감정 아이콘 + 점수 표시 */}
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ mr: 1 }}>
          {moodIcon}
        </Typography>
        {diary.score !== undefined && (
          <Typography variant="body1"> X {diary.score}</Typography>
        )}
      </Box>

      <Typography variant="body1" sx={{ mb: 2 }}>
        {diary.content}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mr: 2 }}
        onClick={() => navigate(`/diary/edit/${id}`)}
      >
        수정
      </Button>
      <Button variant="outlined" color="error" onClick={handleDelete}>
        삭제
      </Button>
    </Box>
  );
}
