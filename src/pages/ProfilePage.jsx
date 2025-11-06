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
  Stack,
  Divider,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
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
  const theme = useTheme();
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

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) return;

      try {
        // 유저 정보
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
    } catch (error) {
      console.error("닉네임 저장 실패:", error.message);
    }
  };

  /** 아바타 변경 */
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
    } catch (error) {
      console.error("아바타 업데이트 실패:", error.message);
    }
  };

  /** 비밀번호 변경 */
  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      window.alert("비밀번호는 6자리 이상이어야 합니다.");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("비밀번호 변경 실패:", error.message);
      if (error.code === "auth/requires-recent-login") {
        window.alert("보안을 위해 다시 로그인 후 시도해주세요.");
      } else {
        window.alert("비밀번호 변경 실패: " + error.message);
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

  const primary = theme.palette.primary.main;
  const panelBg = alpha(theme.palette.primary.main, 0.08);   // 상단 카드 틴트
  const chipBg = alpha(theme.palette.primary.main, 0.12);    // 칩 배경

  return (
    <div className="container">
      <Box sx={{ mt: 5, mb: 6 }}>
        {/* 상단 프로필 카드 */}
        <Card
          sx={{
            mb: 4,
            textAlign: "center",
            boxShadow: theme.shadows[1],
            background: `linear-gradient(180deg, ${panelBg}, transparent)`,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  mx: "auto",
                  mb: 2,
                  bgcolor: primary,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 700,
                  fontSize: 28,
                }}
              >
                {selectedAvatar ? (
                  <FontAwesomeIcon
                    icon={avatarIcons.find(
                      (icon) => icon.iconName === selectedAvatar
                    )}
                    size="lg"
                    color="white"
                  />
                ) : (
                  nickname[0]?.toUpperCase() ||
                  currentUser.email[0]?.toUpperCase()
                )}
              </Avatar>

              {/* 아바타 수정 버튼 */}
              <IconButton
                size="small"
                onClick={() => setAvatarModalOpen(true)}
                sx={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: theme.shadows[2],
                  "&:hover": { bgcolor: alpha(primary, 0.1) },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* 닉네임 + 편집 */}
            <Box sx={{ mt: 1.5 }}>
              {editingNickname ? (
                <Stack direction="row" spacing={1} justifyContent="center">
                  <TextField
                    size="small"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNicknameSave}
                  >
                    저장
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => setEditingNickname(false)}
                  >
                    취소
                  </Button>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {nickname || "닉네임 없음"}
                  </Typography>
                  <IconButton size="small" onClick={() => setEditingNickname(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Box>

            {/* 간단 통계 */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 2.5 }}
            >
              <Box
                sx={{
                  px: 1.25,
                  py: 0.5,
                  bgcolor: chipBg,
                  borderRadius: 999,
                  minWidth: 120,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  총 일기: {diaryCount}건
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.5,
                  bgcolor: chipBg,
                  borderRadius: 999,
                  minWidth: 120,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  평균 점수: {averageScore}
                </Typography>
              </Box>
            </Stack>

            {/* 비번 변경 섹션 */}
            <Box sx={{ mt: 3 }}>
              {!showPasswordInput ? (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowPasswordInput(true)}
                >
                  비밀번호 변경
                </Button>
              ) : (
                <Stack spacing={1}>
                  <TextField
                    type="password"
                    placeholder="새 비밀번호 (6자 이상)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handlePasswordChange}
                    >
                      저장
                    </Button>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => setShowPasswordInput(false)}
                    >
                      취소
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* 하단 액션들 */}
        <Stack spacing={1.2}>
          <Button
            component={Link}
            to="/calendar"
            variant="outlined"
            color="primary"
            fullWidth
          >
            내 일기 보러가기
          </Button>

          <Button
            component={Link}
            to="/admin"
            variant="outlined"
            color="primary"
            fullWidth
          >
            자동 문구 추가하기
          </Button>

          <Divider sx={{ my: 0.5 }} />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </Stack>

        {/* 아바타 선택 모달 */}
        <Modal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)}>
          <Box
            sx={{
              backgroundColor: "background.paper",
              p: 3,
              maxWidth: 420,
              width: "92%",
              mx: "auto",
              my: "8%",
              borderRadius: 3,
              boxShadow: theme.shadows[6],
              outline: "none",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              아바타 선택
            </Typography>
            <Grid container spacing={1.5}>
              {avatarIcons.map((icon, index) => {
                const selected = selectedAvatar === icon.iconName;
                return (
                  <Grid item xs={3} key={index}>
                    <Box
                      onClick={() => handleAvatarSelect(icon)}
                      sx={{
                        cursor: "pointer",
                        textAlign: "center",
                        p: 1,
                        border: selected
                          ? `2px solid ${primary}`
                          : "1px solid transparent",
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                        "&:hover": { backgroundColor: alpha(primary, 0.06) },
                      }}
                    >
                      <FontAwesomeIcon
                        icon={icon}
                        size="xl"
                        color={primary}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Modal>
      </Box>
    </div>
  );
}
