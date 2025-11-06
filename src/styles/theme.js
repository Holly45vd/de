// src/styles/theme.js
import { createTheme } from "@mui/material";

const coral = "#FF6B6B";     // CTA
const blush = "#F4C2C2";     // 서브 배경/칩
const navy  = "#0A0F29";     // 본문/헤더
const burg  = "#8C0B1E";     // 포인트

export const theme = createTheme({
  palette: {
    mode: "light",
    primary:   { main: coral, contrastText: "#fff" },
    secondary: { main: burg,  contrastText: "#fff" },
    background:{ default: "#FFF8F8", paper: "#FFFFFF" },
    text:      { primary: navy, secondary: "#2F3650" },
    info:      { main: blush, contrastText: navy },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: `"Orbit","Hi Melody","Gaegu","ZCOOL KuaiLe",system-ui,sans-serif`,
    h5:   { fontWeight: 700 },
    body1:{ lineHeight: 1.7 },
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
        root: { background: blush, color: navy, fontWeight: 600 },
      },
    },
  },
});
