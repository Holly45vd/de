// src/context/ColorThemeContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme, AVAILABLE_THEMES } from "../styles/theme";

const ColorThemeContext = createContext(null);

export function useColorTheme() {
  return useContext(ColorThemeContext);
}

export function ColorThemeProvider({ children }) {
  // 기본값: localStorage → 없으면 coral
  const [themeName, setThemeNameState] = useState(() => {
    return localStorage.getItem("appTheme") || "coral";
  });

  // 나중에 필요하면 여기서 Firestore 의 preferredThemeId 도 섞을 수 있음
  useEffect(() => {
    const stored = localStorage.getItem("appTheme");
    if (
      stored &&
      AVAILABLE_THEMES.some((opt) => opt.id === stored)
    ) {
      setThemeNameState(stored);
    }
  }, []);

  const muiTheme = useMemo(
    () => createAppTheme(themeName),
    [themeName]
  );

  const handleChangeTheme = (name) => {
    // 존재하는 테마만 허용
    if (!AVAILABLE_THEMES.some((opt) => opt.id === name)) return;
    setThemeNameState(name);
    localStorage.setItem("appTheme", name);   // 👉 이후부터 이게 디폴트
  };

  return (
    <ColorThemeContext.Provider
      value={{
        themeName,
        setThemeName: handleChangeTheme,
        themeOptions: AVAILABLE_THEMES,
      }}
    >
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorThemeContext.Provider>
  );
}
