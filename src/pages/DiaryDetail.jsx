// src/pages/DiaryDetail.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { moodIcons } from "../context/moodIcons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// FontAwesome Icons
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

export default function DiaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);

  // ✅ 점수 아이콘 정의
  const scoreIcons = [
    { gray: faFaceSadTear, color: fasFaceSadTear },
    { gray: faFaceTired, color: fasFaceTired },
    { gray: faFaceMeh, color: fasFaceMeh },
    { gray: faFaceSmileWink, color: fasFaceSmileWink },
    { gray: faFaceLaughBeam, color: fasFaceLaughBeam },
  ];

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const ref = doc(db, "diaries", id);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setDiary({ id: snapshot.id, ...snapshot.data() });
        } else {
          alert("일기를 찾을 수 없습니다.");
          navigate("/calendar");
        }
      } catch (error) {
        console.error("일기 불러오기 오류:", error);
      }
    };

    fetchDiary();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "diaries", id));
      navigate("/calendar");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  if (!diary) return <Typography>Loading...</Typography>;

  // ✅ 감정 날씨 아이콘
  const moodIconData = moodIcons[diary.mood];

  return (
    <Box sx={{ p: 3 }}>
      {/* === Breadcrumb === */}
      <Typography
        variant="body2"
        sx={{
          color: "#45C4B0",
          mb: 2,
          cursor: "pointer",
          textAlign: "left",
        }}
        onClick={() => navigate("/calendar")}
      >
        캘린더 &gt; <span style={{ color: "#000" }}>일기 보기</span>
      </Typography>

      {/* === 감정 날씨 + 기분 점수 === */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 4,
          mb: 3,
        }}
      >
        {/* 날씨(감정) 아이콘 */}
        {moodIconData && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={moodIconData.color}
              alt={diary.mood}
              style={{ width: 90, height: 70 }}
            />
            <Typography
              variant="caption"
              sx={{ mt: 1, fontSize: "0.8rem", color: "#45C4B0" }}
            >
              {diary.mood.split(" ")[1]}
            </Typography>
          </Box>
        )}

        {/* 기분 점수 아이콘 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {scoreIcons.map((icon, index) => {
            const value = index + 1;
            const isActive = value <= diary.score;

            return (
              <FontAwesomeIcon
                key={index}
                icon={isActive ? icon.color : icon.gray}
                style={{
                  fontSize: "32px",
                  color: isActive ? "#45C4B0" : "#808080",
                  transition: "color 0.3s ease",
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* === 일기 내용 === */}
      <Typography
        variant="body1"
        sx={{
          mb: 3,
          textAlign: "left",
          lineHeight: 1.6,
          whiteSpace: "pre-line",
        }}
      >
        {diary.content}
      </Typography>

      {/* === 수정/삭제 버튼 === */}
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={() => navigate(`/diary/edit/${id}`)}
          sx={{
            backgroundColor: "#45C4B0",
            "&:hover": { backgroundColor: "#3ca896" },
          }}
        >
          수정
        </Button>
        <Button variant="outlined" color="error" onClick={handleDelete}>
          삭제
        </Button>
      </Box>
    </Box>
  );
}
