// src/pages/DiaryDetail.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  Stack,
  Divider,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { moodIcons } from "../context/moodIcons";
import dayjs from "dayjs";
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
import { toSafeDate, normalizeDiary } from "../utils/firebaseHelpers";

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
        setDiary(normalizeDiary({ id: snapshot.id, ...snapshot.data() }));
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
      const q = query(
        collection(db, "diaries"),
        where("userId", "==", diary.userId)
      );
      const snap = await getDocs(q);
      const diaries = snap.docs
        .map((d) => normalizeDiary({ id: d.id, ...d.data() }))
        .sort(
          (a, b) => (toSafeDate(a.date)?.getTime() || 0) - (toSafeDate(b.date)?.getTime() || 0)
        );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (diary) fetchAllDiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diary]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "diaries", id));
      setConfirmOpen(false);
      navigate("/calendar");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (!diary) return <Typography>Loading...</Typography>;

  const moodIconData = diary.mood ? moodIcons[diary.mood] : null;
  const createdAt = toSafeDate(diary.date);
  const updatedAt = toSafeDate(diary.updatedAt);

  return (
    <div className="container">
      <Box>
        {/* 상단 네비게이션 */}
        <Button
          variant="text"
          color="primary"
          startIcon={<ArrowBackIosNewIcon fontSize="small" />}
          sx={{ mb: 2 }}
          onClick={() => navigate(-1)}
        >
          이전 페이지
        </Button>

        {/* 오늘의 기분 + 점수 */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={6}
          mb={3}
          sx={{ textAlign: "center" }}
        >
          {/* 기분 */}
          {moodIconData && (
            <Box display="flex" alignItems="center" gap={1}>
              <img
                src={moodIconData.color}
                alt={diary.mood}
                style={{ width: 75, height: 65 }}
              />
              <Typography variant="body1" sx={{ color: "primary.main", fontWeight: 700 }}>
                {moodIconData.ko} ({moodIconData.en})
              </Typography>
            </Box>
          )}

          {/* 점수 */}
          {diary.score != null && (
            <Box display="flex" alignItems="center" gap={1}>
              <FontAwesomeIcon
                icon={scoreIcons[Number(diary.score) - 1]?.color || faFaceMeh}
                size="2x"
                style={{ color: "rgba(0,0,0,0.54)" }}
              />
              <Typography variant="body1" sx={{ color: "primary.main", fontWeight: 700 }}>
                {diary.score} 점
              </Typography>
            </Box>
          )}
        </Box>

        {/* 본문 */}
        <Typography variant="body1" className="diary-content" sx={{ mb: 3 }}>
          {diary.content || ""}
        </Typography>

        {/* 작성/수정 정보 */}
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            작성일: {createdAt ? dayjs(createdAt).format("YYYY-MM-DD HH:mm") : "-"}
          </Typography>
          {updatedAt && (
            <Typography variant="body2" color="text.secondary">
              마지막 수정: {dayjs(updatedAt).format("YYYY-MM-DD HH:mm")}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* 이전/다음 이동 */}
        <Box display="flex" justifyContent="space-between" mb={3} gap={1}>
          <Button
            variant="outlined"
            color="primary"
            disabled={!prevId}
            onClick={() => navigate(`/diary/${prevId}`)}
          >
            이전 일기
          </Button>
          <Button
            variant="outlined"
            color="primary"
            disabled={!nextId}
            onClick={() => navigate(`/diary/${nextId}`)}
          >
            다음 일기
          </Button>
        </Box>

        {/* 수정/삭제 */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/diary/edit/${id}`)}
          >
            수정
          </Button>
          <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>
            삭제
          </Button>
        </Stack>

        {/* 삭제 확인 모달 */}
        <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 320,
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              boxShadow: 6,
            }}
          >
            <Typography sx={{ mb: 2 }}>정말 삭제하시겠습니까?</Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button onClick={() => setConfirmOpen(false)}>취소</Button>
              <Button color="error" variant="contained" onClick={handleDelete}>
                삭제
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </div>
  );
}
