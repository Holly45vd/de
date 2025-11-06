// src/pages/LoginPage.jsx
import React, { useState, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff, MailOutline, LockOutlined } from "@mui/icons-material";
import { login, signUp } from "../firebase/firebaseAuth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // 에러/피드백
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  /** Firebase 에러 코드 → 사용자 메시지 */
  const getErrorMessage = useCallback((code) => {
    const map = {
      "auth/email-already-in-use": "이미 사용 중인 이메일입니다.",
      "auth/invalid-email": "올바른 이메일 형식이 아닙니다.",
      "auth/weak-password": "비밀번호가 너무 약합니다. 6자 이상 입력해주세요.",
      "auth/user-not-found": "해당 이메일로 가입된 계정이 없습니다.",
      "auth/wrong-password": "비밀번호가 올바르지 않습니다.",
      "auth/invalid-credential": "이메일 또는 비밀번호가 잘못되었습니다.",
      "auth/too-many-requests": "시도가 너무 많습니다. 잠시 후 다시 시도해주세요.",
      "auth/network-request-failed": "네트워크 연결 문제입니다.",
    };
    return map[code] || "알 수 없는 오류가 발생했습니다. 다시 시도해주세요.";
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      setSnack({ open: true, type: "error", msg: "이메일과 비밀번호를 입력해주세요." });
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setSnack({ open: true, type: "success", msg: "회원가입 성공! 로그인해주세요." });
      } else {
        await login(email, password);
        setSnack({ open: true, type: "success", msg: "로그인 성공!" });
      }
      navigate("/home");
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      setSnack({ open: true, type: "error", msg: getErrorMessage(error.code) });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <Box sx={{ px: 2, py: { xs: 4, sm: 8 } }}>
      <Paper
        elevation={2}
        sx={{
          maxWidth: 420,
          mx: "auto",
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {isSignUp ? "회원가입" : "로그인"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          {isSignUp ? "새 계정을 만들어 시작해요." : "계정으로 계속하세요."}
        </Typography>

        <Stack spacing={2}>
          {/* 이메일 */}
          <TextField
            label="이메일"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
            placeholder="example@email.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {/* 비밀번호 */}
          <TextField
            label="비밀번호"
            type={showPw ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
            placeholder="6자 이상"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="비밀번호 보기"
                    onClick={() => setShowPw((v) => !v)}
                    edge="end"
                  >
                    {showPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 액션 */}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "처리중..." : isSignUp ? "회원가입" : "로그인"}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => setIsSignUp((v) => !v)}
            disabled={loading}
          >
            {isSignUp ? "로그인으로 전환" : "회원가입으로 전환"}
          </Button>
        </Stack>
      </Paper>

      {/* 스낵바 피드백 */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
