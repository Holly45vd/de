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

  const handleSubmit = async () => {
    try {
      if (isSignUp) {
        await signUp(email, password);
        alert("회원가입 성공!");
      } else {
        await login(email, password);
        alert("로그인 성공!");
      }
      navigate("/home");
    } catch (error) {
      alert("오류 발생: " + error.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" mb={2} textAlign="center">
        {isSignUp ? "회원가입" : "로그인"}
      </Typography>

      <TextField
        label="이메일"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="비밀번호"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSubmit}
      >
        {isSignUp ? "회원가입" : "로그인"}
      </Button>

      <Button
        variant="text"
        fullWidth
        sx={{ mt: 1 }}
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? "로그인으로 전환" : "회원가입으로 전환"}
      </Button>
    </Box>
  );
}
