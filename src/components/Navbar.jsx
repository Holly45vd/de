// src/components/Navbar.jsx
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser } = useAuth();

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#45C4B0" }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: "none", color: "#fff" }}
        >
          Da E
        </Typography>

        {/* 캘린더 */}
        <Button component={Link} to="/calendar" color="inherit" sx={{ mr: 2 }}>
          캘린더
        </Button>

        {/* 로그인 상태 확인 */}
        {currentUser ? (
          <Button component={Link} to="/profile" color="inherit" sx={{ mr: 2 }}>
            프로필
          </Button>
        ) : (
          <Button component={Link} to="/login" color="inherit" sx={{ mr: 2 }}>
            로그인
          </Button>
        )}

        {/* 새 일기 작성 버튼 */}
        {currentUser && (
          <Button
            component={Link}
            to="/editor"
            variant="outlined"
            sx={{ backgroundColor: "#fff", color: "#45C4B0" }}
          >
            새 일기 작성
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
