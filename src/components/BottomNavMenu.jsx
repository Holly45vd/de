import React, { useState } from "react";
import { Box, Fab, Slide, Fade, IconButton } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
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
  const theme = useTheme();

  const toggleMenu = () => setOpen(!open);

  const primary = theme.palette.primary.main;
  const primaryHover = theme.palette.primary.dark ?? primary;
  const contrast = theme.palette.primary.contrastText;
  const panelBg = alpha(theme.palette.background.paper, 0.7);
  const panelShadow = theme.shadows[4];

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
            border: open ? `2px solid ${primary}` : "none",
            backgroundColor: open ? "transparent" : primary,
            color: open ? primary : contrast,
            "&:hover": {
              backgroundColor: open ? alpha(primary, 0.08) : primaryHover,
            },
          }}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </Fab>
      </Box>

      {/* === 메뉴 아이콘 영역 === */}
      <Fade in={open} timeout={{ enter: 400, exit: 500 }} mountOnEnter unmountOnExit>
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
              backgroundColor: panelBg,        // 반투명 배경(테마)
              backdropFilter: "blur(8px)",
              borderRadius: "12px",
              boxShadow: panelShadow,
              transition: "all 0.3s ease",

              // 모든 IconButton 공통 스타일
              "& .MuiIconButton-root": {
                backgroundColor: "transparent",
                color: primary,
                borderRadius: "50%",
                width: 50,
                height: 50,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: primary,
                  color: contrast,
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
