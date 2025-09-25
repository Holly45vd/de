// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login, signUp } from "../firebase/firebaseAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  /** 로그인 또는 회원가입 처리 */
  const handleSubmit = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        alert("회원가입 성공! 로그인 후 닉네임을 수정할 수 있습니다.");
      } else {
        await login(email, password);
        alert("로그인 성공!");
      }
      navigate("/home");
    } catch (error) {
      alert("오류 발생: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: "#fff",
      }}
    >
      {/* 제목 */}
      <Typography variant="h5" mb={2} textAlign="center">
        {isSignUp ? "회원가입" : "로그인"}
      </Typography>

      {/* 이메일 입력 */}
      <TextField
        label="이메일"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* 비밀번호 입력 */}
      <TextField
        label="비밀번호"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* 제출 버튼 */}
      <Button
        fullWidth
        className="btn-primary"
        sx={{ mt: 2 }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "처리중..." : isSignUp ? "회원가입" : "로그인"}
      </Button>

      {/* 전환 버튼 */}
      <Button
        fullWidth
        className="btn-outline"
        sx={{ mt: 1 }}
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? "로그인으로 전환" : "회원가입으로 전환"}
      </Button>
    </Box>
  );
}
