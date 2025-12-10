// src/styles/theme.js
import { createTheme } from "@mui/material";

// 기본 컬러셋들
// 각 팔레트: primary / secondary / background / paper / text 색 정의
const palettes = {
  // 기존 코랄
  coral: {
    primary: "#FF6B6B",
    secondary: "#8C0B1E",
    background: "#FFF8F8",
    paper: "#FFFFFF",
    textPrimary: "#0A0F29",
    textSecondary: "#2F3650",
  },

  // 기존 네이비
  navy: {
    primary: "#28336D",
    secondary: "#8C7A5B",
    background: "#E8E1D6",
    paper: "#F5EFE4",
    textPrimary: "#283036",
    textSecondary: "#4B4F5C",
  },

  // 🎨 팔레트 1 : 핑크/블루/옐로우 계열 (#D989B5, #72C1F2, #F2C46D, #A68568)
  pastelCandy: {
    primary: "#D989B5",     // 메인 핑크
    secondary: "#72C1F2",   // 서브 블루
    background: "#FFF7FB",  // 아주 연한 핑크 톤 배경
    paper: "#FFFFFF",
    textPrimary: "#4A2E3A",   // 진한 브라운톤 텍스트
    textSecondary: "#6B4B58",
    // 필요하면 accent 등에 F2C46D, A68568 써도 됨
  },

  // 🎨 팔레트 2 : 퍼플/딥블루 + 골드 (#7F71D9, #282673, #010326, #F2AB27, #D9851E)
  deepAurora: {
    primary: "#282673",     // 딥 퍼플 네이비
    secondary: "#F2AB27",   // 골드
    background: "#F4F3FF",  // 아주 연한 보라 톤 배경
    paper: "#FFFFFF",
    textPrimary: "#010326", // 딥 네이비 텍스트
    textSecondary: "#282673",
  },
};

// 테마 생성 함수
export function createAppTheme(mode = "coral") {
  const p = palettes[mode] ?? palettes.coral;

  return createTheme({
    palette: {
      mode: "light",
      primary:   { main: p.primary,   contrastText: "#fff" },
      secondary: { main: p.secondary, contrastText: "#fff" },
      background:{ default: p.background, paper: p.paper },
      text:      { primary: p.textPrimary, secondary: p.textSecondary },
      info:      { main: "#F4C2C2", contrastText: p.textPrimary },
    },
    typography: {
      fontFamily: `"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
      h5: { fontWeight: 800 },
    },
    components: {
      MuiButton: {
        defaultProps: { variant: "contained", color: "primary" },
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 700, boxShadow: "none" },
          containedPrimary: { boxShadow: "none" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
    },
  });
}

// 기본 테마(앱 최초 로딩용)
export const theme = createAppTheme("coral");

// 🔹 ColorThemeContext / UI에서 쓰기 위한 옵션 목록
export const AVAILABLE_THEMES = [
  { id: "coral",       label: "코랄" },
  { id: "navy",        label: "네이비" },
  { id: "pastelCandy", label: "파스텔 캔디" },
  { id: "deepAurora",  label: "딥 오로라" },
];
