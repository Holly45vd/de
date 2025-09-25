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

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) return;

      try {
        // 유저 정보 가져오기
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setNickname(userData.nickname || "");
          setSelectedAvatar(userData.avatar || null);
        }

        // 일기 데이터 가져오기
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
      alert("아바타가 업데이트되었습니다.");
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
    <div className="container">
      <Box sx={{ mt: 5 }}>
        {/* 상단 프로필 박스 */}
        <Card
          sx={{
            mb: 4,
            textAlign: "center",
            boxShadow: "none", // 그림자 제거
            backgroundColor: "#E0F7F5", // 민트색
            borderRadius: 2,
            p: 2,
          }}
        >
          <CardContent>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "var(--color-primary)",
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

            {/* 닉네임 */}
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
                  <IconButton className="btn-primary" onClick={handleNicknameSave}>
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

            {/* 비밀번호 변경 */}
            <Box sx={{ mt: 3, mb: 2 }}>
              {!showPasswordInput ? (
                <Button
                  fullWidth
                  className="btn-primary"
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
                    fullWidth
                    className="btn-primary"
                    onClick={handlePasswordChange}
                  >
                    저장
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        

        {/* 하단 버튼 */}
        <Button
          component={Link}
          to="/calendar"
          className="btn-outline"
          fullWidth
          sx={{ mb: 2 }}
        >
          내 일기 보러가기
        </Button>

        <Button
          component={Link}
          to="/admin"
          className="btn-outline"
          fullWidth
          sx={{ mb: 2 }}
        >
          자동 문구 추가하기
        </Button>

        <Button className="btn-primary" fullWidth onClick={handleLogout}>
          로그아웃
        </Button>

        {/* 아바타 선택 모달 */}
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
                          ? "2px solid var(--color-primary)"
                          : "1px solid transparent",
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                    onClick={() => handleAvatarSelect(icon)}
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      size="2x"
                      color="var(--color-primary)"
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Modal>
      </Box>
    </div>
  );
}
