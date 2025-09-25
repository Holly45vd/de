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

  /** Firebase 에러 코드 → 사용자 친화 메시지 변환 */
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      // 회원가입 관련
      "auth/email-already-in-use": "이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.",
      "auth/invalid-email": "올바른 이메일 형식이 아닙니다. 다시 확인해주세요.",
      "auth/weak-password": "비밀번호가 너무 약합니다. 6자 이상 입력해주세요.",

      // 로그인 관련
      "auth/user-not-found": "해당 이메일로 가입된 계정이 없습니다.",
      "auth/wrong-password": "비밀번호가 올바르지 않습니다. 다시 시도해주세요.",
      "auth/invalid-credential": "이메일 또는 비밀번호가 잘못되었습니다.",

      // 기타
      "auth/too-many-requests":
        "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
      "auth/network-request-failed": "네트워크 연결에 문제가 있습니다. 인터넷 상태를 확인해주세요.",
    };

    return errorMessages[errorCode] || "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.";
  };

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
      console.error("Firebase Auth Error:", error);
      alert(getErrorMessage(error.code));
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
        placeholder="예: example@email.com"
      />

      {/* 비밀번호 입력 */}
      <TextField
        label="비밀번호"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="6자 이상 입력"
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
