// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Grid,
  TextField,
  IconButton,
  Modal,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/firebaseAuth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { updatePassword } from "firebase/auth";
import avatarIcons from "../context/avatarIcons";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [editingNickname, setEditingNickname] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const [diaryCount, setDiaryCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  /** 로그인 체크 */
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  /** 사용자 데이터 및 통계 불러오기 */
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) return;

      try {
        // 사용자 정보
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setNickname(userData.nickname || "");
          setSelectedAvatar(userData.avatar || null);
        }

        // 일기 통계
        const q = query(
          collection(db, "diaries"),
          where("userId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);

        let totalScore = 0;
        let count = 0;
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.score !== undefined && !isNaN(Number(data.score))) {
            totalScore += Number(data.score);
            count++;
          }
        });

        setDiaryCount(count);
        setAverageScore(count > 0 ? (totalScore / count).toFixed(1) : 0);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error.message);
      }
    };

    fetchData();
  }, [currentUser]);

  /** 닉네임 저장 */
  const handleNicknameSave = async () => {
    if (!currentUser?.uid) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          email: currentUser.email,
          nickname,
          avatar: selectedAvatar,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      setEditingNickname(false);
      alert("닉네임이 업데이트되었습니다.");
    } catch (error) {
      console.error("닉네임 저장 실패:", error.message);
    }
  };

  /** 아바타 선택 → 즉시 Firestore 업데이트 */
  const handleAvatarSelect = async (icon) => {
    if (!currentUser?.uid) return;
    try {
      setSelectedAvatar(icon.iconName);
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          avatar: icon.iconName,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      setAvatarModalOpen(false);
      console.log("아바타가 업데이트되었습니다:", icon.iconName);
    } catch (error) {
      console.error("아바타 업데이트 실패:", error.message);
    }
  };

  /** 비밀번호 변경 */
  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("비밀번호는 6자리 이상이어야 합니다.");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      console.log("비밀번호가 변경되었습니다.");

      // 변경 직후 로그아웃 → 로그인 페이지로 이동
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("비밀번호 변경 실패:", error.message);
      if (error.code === "auth/requires-recent-login") {
        alert("보안을 위해 다시 로그인 후 시도해주세요.");
      } else {
        alert("비밀번호 변경 실패: " + error.message);
      }
    }
  };

  /** 로그아웃 */
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error.message);
    }
  };

  if (!currentUser) return null;

  return (
    <Box sx={{ p: 3, maxWidth: "500px", mx: "auto", mt: 5 }}>
      {/* ===== 프로필 카드 ===== */}
      <Card sx={{ mb: 4, textAlign: "center", boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          {/* 아바타 */}
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                bgcolor: "#45C4B0",
              }}
            >
              {selectedAvatar ? (
                <FontAwesomeIcon
                  icon={avatarIcons.find(
                    (icon) => icon.iconName === selectedAvatar
                  )}
                  size="2x"
                  color="white"
                />
              ) : (
                nickname[0]?.toUpperCase() || currentUser.email[0]?.toUpperCase()
              )}
            </Avatar>

            {/* 아바타 수정 */}
            <IconButton
              size="small"
              onClick={() => setAvatarModalOpen(true)}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "white",
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* 닉네임 수정 */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {editingNickname ? (
              <>
                <TextField
                  size="small"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <IconButton
                  color="primary"
                  onClick={handleNicknameSave}
                  sx={{
                    bgcolor: "#45C4B0",
                    color: "#fff",
                    "&:hover": { bgcolor: "#38a99a" },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Typography variant="h6">
                  {nickname || "닉네임 없음"}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setEditingNickname(true)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>

          {/* ===== 비밀번호 변경 ===== */}
          <Box sx={{ mt: 3, mb: 2 }}>
            {!showPasswordInput ? (
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#45C4B0",
                  "&:hover": { backgroundColor: "#38a99a" },
                }}
                onClick={() => setShowPasswordInput(true)}
              >
                비밀번호 변경
              </Button>
            ) : (
              <>
                <TextField
                  type="password"
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlePasswordChange}
                  sx={{
                    backgroundColor: "#45C4B0",
                    "&:hover": { backgroundColor: "#38a99a" },
                  }}
                >
                  저장
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ===== 통계 카드 ===== */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6}>
          <Card sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="subtitle2">전체 나의 일기</Typography>
            <Typography variant="h6">{diaryCount}</Typography>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="subtitle2">평균 기분 점수</Typography>
            <Typography variant="h6">{averageScore}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ===== 메뉴 버튼 ===== */}
      <Button
        component={Link}
        to="/calendar"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
      >
        내 일기 보러가기
      </Button>

      {/* ===== 메뉴 버튼 ===== */}
      <Button
        component={Link}
        to="/admin"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
      >
        문구추가하기
      </Button>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleLogout}
        sx={{ backgroundColor: "#45C4B0" }}
      >
        로그아웃
      </Button>

      {/* ===== 아바타 선택 모달 ===== */}
      <Modal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)}>
        <Box
          sx={{
            backgroundColor: "white",
            p: 3,
            maxWidth: 400,
            mx: "auto",
            my: "10%",
            borderRadius: 2,
            overflow: "auto",
          }}
        >
          <Typography variant="h6" mb={2}>
            아바타 선택
          </Typography>
          <Grid container spacing={2}>
            {avatarIcons.map((icon, index) => (
              <Grid item xs={3} key={index}>
                <Box
                  sx={{
                    cursor: "pointer",
                    textAlign: "center",
                    p: 1,
                    border:
                      selectedAvatar === icon.iconName
                        ? "2px solid #45C4B0"
                        : "1px solid transparent",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                  onClick={() => handleAvatarSelect(icon)}
                >
                  <FontAwesomeIcon icon={icon} size="2x" color="#45C4B0" />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
}
