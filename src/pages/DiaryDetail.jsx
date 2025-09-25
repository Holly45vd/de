// src/pages/DiaryDetail.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { moodIcons } from "../context/moodIcons";
import dayjs from "dayjs";

// FontAwesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  const [allDiaries, setAllDiaries] = useState([]);
  const [prevId, setPrevId] = useState(null);
  const [nextId, setNextId] = useState(null);

  // 삭제 확인 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);

  /** ✅ 점수 아이콘 */
  const scoreIcons = [
    { gray: faFaceSadTear, color: fasFaceSadTear },
    { gray: faFaceTired, color: fasFaceTired },
    { gray: faFaceMeh, color: fasFaceMeh },
    { gray: faFaceSmileWink, color: fasFaceSmileWink },
    { gray: faFaceLaughBeam, color: fasFaceLaughBeam },
  ];

  /** ✅ 특정 일기 데이터 불러오기 */
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

  /** ✅ 전체 일기 목록 가져와서 이전/다음 일기 계산 */
  const fetchAllDiaries = async () => {
    try {
      const q = query(collection(db, "diaries"), where("userId", "==", diary?.userId));
      const snap = await getDocs(q);
      const diaries = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // 날짜 기준 정렬
      diaries.sort((a, b) => a.date.toDate() - b.date.toDate());

      setAllDiaries(diaries);

      const currentIndex = diaries.findIndex((d) => d.id === id);

      setPrevId(currentIndex > 0 ? diaries[currentIndex - 1].id : null);
      setNextId(currentIndex < diaries.length - 1 ? diaries[currentIndex + 1].id : null);
    } catch (error) {
      console.error("전체 일기 목록 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchDiary();
  }, [id]);

  useEffect(() => {
    if (diary) fetchAllDiaries();
  }, [diary]);

  /** ✅ 삭제 핸들러 */
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "diaries", id));
      alert("일기가 삭제되었습니다.");
      navigate("/calendar");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  /** ✅ 로딩 상태 */
  if (!diary) return <Typography>Loading...</Typography>;

  // ✅ 감정 아이콘
  const moodIconData = moodIcons[diary.mood];

  return (
    <Box sx={{ p: 3 }}>
      {/* === Breadcrumb === */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="body2"
          sx={{
            color: "#45C4B0",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)} // 바로 직전 페이지로 이동
        >
          ← 이전 페이지
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#45C4B0",
            cursor: "pointer",
          }}
          onClick={() => navigate("/calendar")} // 캘린더로 이동
        >
          캘린더로 이동
        </Typography>
      </Box>

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
              {diary.mood}
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

      {/* 작성일, 수정일 */}
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        작성일: {dayjs(diary.date.toDate()).format("YYYY-MM-DD HH:mm")}
      </Typography>
      {diary.updatedAt && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          마지막 수정: {dayjs(diary.updatedAt.toDate()).format("YYYY-MM-DD HH:mm")}
        </Typography>
      )}

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

{/* === 이전 / 다음 버튼 === */}
{/* === 이전 / 다음 버튼 === */}
<Box display="flex" justifyContent="space-between" mb={3}>
  <Button
    variant="outlined"
    disabled={!prevId}
    onClick={() => navigate(`/diary/${prevId}`)}
    sx={{
      borderColor: prevId ? "#45C4B0" : "#ccc", // 테두리 민트
      color: prevId ? "#45C4B0" : "#ccc",       // 글자 민트
      fontWeight: "bold",
      "&:hover": {
        backgroundColor: "rgba(69,196,176,0.05)", // 살짝 투명 민트 배경
        borderColor: "#3ca896",                   // hover 시 진한 민트
        color: "#3ca896",
      },
    }}
  >
    이전 일기
  </Button>

  <Button
    variant="outlined"
    disabled={!nextId}
    onClick={() => navigate(`/diary/${nextId}`)}
    sx={{
      borderColor: nextId ? "#45C4B0" : "#ccc",
      color: nextId ? "#45C4B0" : "#ccc",
      fontWeight: "bold",
      "&:hover": {
        backgroundColor: "rgba(69,196,176,0.05)",
        borderColor: "#3ca896",
        color: "#3ca896",
      },
    }}
  >
    다음 일기
  </Button>
</Box>


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
        <Button
          variant="outlined"
          color="error"
          onClick={() => setConfirmOpen(true)}
        >
          삭제
        </Button>
      </Box>

      {/* === 삭제 확인 모달 === */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography sx={{ mb: 2 }}>정말 삭제하시겠습니까?</Typography>
          <Box display="flex" justifyContent="space-around">
            <Button onClick={() => setConfirmOpen(false)}>취소</Button>
            <Button color="error" onClick={handleDelete}>
              삭제
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
