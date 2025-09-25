// src/components/BottomNavMenu.jsx
import React, { useState } from "react";
import { Box, Fab, Slide, Fade, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";

export default function BottomNavMenu() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();

  const toggleMenu = () => setOpen(!open);

  return (
    <Box>
      {/* === 오른쪽 하단 플로팅 버튼 === */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 2000,
        }}
      >
        <Fab
          onClick={toggleMenu}
          sx={{
            width: 56,
            height: 56,
            border: open ? "2px solid #fff" : "none", // 열린 상태 → 흰색 테두리
            backgroundColor: open ? "transparent" : "#45C4B0", // 열린 상태 → 투명, 닫힌 상태 → 민트
            color: open ? "#45C4B0" : "#fff", // 열린 상태 → X 아이콘 민트, 닫힌 상태 → 흰색
            "&:hover": {
              backgroundColor: open ? "transparent" : "#45C4B0",
            },
          }}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </Fab>
      </Box>

      {/* === 메뉴 아이콘 영역 === */}
      <Fade
        in={open}
        timeout={{ enter: 400, exit: 500 }} // 등장/퇴장 속도
        mountOnEnter
        unmountOnExit
      >
        <Slide
  direction="left"
  in={open}
  timeout={{ enter: 500, exit: 500 }}
  easing={{
    enter: "cubic-bezier(0.4, 0, 0.2, 1)",
    exit: "cubic-bezier(0.4, 0, 0.2, 1)",
  }}
>
  <Box
    sx={{
      position: "fixed",
      bottom: 20,
      right: 80,
      display: "flex",
      gap: 2,
      padding: "8px 12px",
      backgroundColor: "rgba(255, 255, 255, 0.6)", // 반투명 흰색
      backdropFilter: "blur(8px)", // 흐림 효과
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)", // 은은한 그림자
      transition: "all 0.3s ease",

      // 모든 IconButton 스타일 공통화
      "& .MuiIconButton-root": {
        backgroundColor: "transparent",
        color: "#45C4B0",
        borderRadius: "50%",
        width: 50,
        height: 50,
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "#45C4B0",
          color: "#fff",
        },
      },
    }}
  >
    {/* 홈 */}
    <IconButton component={Link} to="/" sx={{ flexDirection: "column" }}>
      <HomeIcon />
    </IconButton>

    {/* 캘린더 */}
    <IconButton component={Link} to="/calendar" sx={{ flexDirection: "column" }}>
      <CalendarMonthIcon />
    </IconButton>

    {/* 새 일기 작성 */}
    {currentUser && (
      <IconButton component={Link} to="/editor" sx={{ flexDirection: "column" }}>
        <EditNoteIcon />
      </IconButton>
    )}

    {/* 프로필 / 로그인 */}
    {currentUser ? (
      <IconButton component={Link} to="/profile" sx={{ flexDirection: "column" }}>
        <AccountCircleIcon />
      </IconButton>
    ) : (
      <IconButton component={Link} to="/login" sx={{ flexDirection: "column" }}>
        <AccountCircleIcon />
      </IconButton>
    )}
  </Box>
</Slide>

      </Fade>
    </Box>
  );
}
