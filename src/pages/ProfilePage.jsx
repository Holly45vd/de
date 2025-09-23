// src/pages/ProfilePage.jsx
import React, { useEffect } from "react";
import { Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../firebase/firebaseAuth";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login"); // 로그인 안 됐으면 강제 이동
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      alert("로그아웃 되었습니다.");
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error.message);
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <Typography variant="h5" gutterBottom>
        프로필
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        <strong>이메일:</strong> {currentUser.email}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleLogout}
        sx={{ width: "80%", maxWidth: "300px" }}
      >
        로그아웃
      </Button>
    </div>
  );
}
