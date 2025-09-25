// src/pages/DiaryDetail.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Modal } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { moodIcons } from "../context/moodIcons";
import dayjs from "dayjs";
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

export default function DiaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  const [allDiaries, setAllDiaries] = useState([]);
  const [prevId, setPrevId] = useState(null);
  const [nextId, setNextId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const fetchAllDiaries = async () => {
    try {
      if (!diary?.userId) return;
      const q = query(collection(db, "diaries"), where("userId", "==", diary.userId));
      const snap = await getDocs(q);
      const diaries = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "diaries", id));
      alert("일기가 삭제되었습니다.");
      navigate("/calendar");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  if (!diary) return <Typography>Loading...</Typography>;

  const moodIconData = moodIcons[diary.mood];

  return (
    <div className="container">
      <Box>
        {/* 이전 페이지로 돌아가기 */}
        <Typography
          variant="body2"
          sx={{ color: "var(--color-primary)", cursor: "pointer", mb: 2 }}
          onClick={() => navigate(-1)}
        >
          ← 이전 페이지
        </Typography>

       {/* 오늘의 기분 + 기분 점수 */}
<Box
  display="flex"
  alignItems="center"
  justifyContent="center"
  gap={6} // 두 블록 사이 간격
  mb={3}
>
  {/* 오늘의 기분 (아이콘 + 텍스트) */}
  {moodIconData && (
    <Box display="flex" alignItems="center" gap={1}>
      <img
        src={moodIconData.color}
        alt={diary.mood}
        style={{ width: 75, height: 65 }}
      />
      <Typography
        variant="body1"
        sx={{ color: "var(--color-primary)", fontWeight: "bold" }}
      >
        {moodIconData.ko}({moodIconData.en})
      </Typography>
    </Box>
  )}

  {/* 기분 점수 (아이콘 + 숫자) */}
  <Box display="flex" alignItems="center" gap={0}>
    <FontAwesomeIcon
      icon={scoreIcons[diary.score - 1]?.color || faFaceMeh}
      size="2x"
      style={{ color: "var(--color-primary)" }}
    />
    <Typography
      variant="body1"
      size="2x"
      sx={{ color: "var(--color-primary)", fontWeight: "bold" }}
    >
      {diary.score} 점
    </Typography>
  </Box>
</Box>



        {/* 일기 본문 */}
        <Typography variant="body1" className="diary-content" sx={{ mb: 3 }}>
          {diary.content}
        </Typography>

        
        {/* 작성일 및 수정일 */}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          작성일: {dayjs(diary.date.toDate()).format("YYYY-MM-DD HH:mm")}
          {diary.updatedAt && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            마지막 수정: {dayjs(diary.updatedAt.toDate()).format("YYYY-MM-DD HH:mm")}
          </Typography>
        )}
        </Typography>
        

        {/* 이전/다음 이동 버튼 */}
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Button
            className="btn-outline"
            disabled={!prevId}
            onClick={() => navigate(`/diary/${prevId}`)}
          >
            이전 일기
          </Button>
          <Button
            className="btn-outline"
            disabled={!nextId}
            onClick={() => navigate(`/diary/${nextId}`)}
          >
            다음 일기
          </Button>
        </Box>

        {/* 수정 및 삭제 버튼 */}
        <Box display="flex" gap={2}>
          <Button className="btn-primary" onClick={() => navigate(`/diary/edit/${id}`)}>
            수정
          </Button>
          <Button className="btn-outline" color="error" onClick={() => setConfirmOpen(true)}>
            삭제
          </Button>
        </Box>

        {/* 삭제 확인 모달 */}
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
    </div>
  );
}
