// src/styles/theme.js
import { createTheme } from "@mui/material";

// 기본 컬러셋들
const palettes = {
  coral: {
    primary: "#FF6B6B",
    secondary: "#8C0B1E",
    background: "#FFF8F8",
    paper: "#FFFFFF",
    textPrimary: "#0A0F29",
    textSecondary: "#2F3650",
  },
  navy: {
    primary: "#28336D",
    secondary: "#8C7A5B",
    background: "#E8E1D6",
    paper: "#F5EFE4",
    textPrimary: "#283036",
    textSecondary: "#4B4F5C",
  },
  // 필요하면 더 추가 (plum, forest 등)
};

// 테마 생성 함수
export function createAppTheme(mode = "coral") {
  const p = palettes[mode] ?? palettes.coral;

  return createTheme({
    palette: {
      mode: "light",
      primary:   { main: p.primary, contrastText: "#fff" },
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
