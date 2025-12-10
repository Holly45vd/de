// src/context/ColorThemeContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "../styles/theme";

const ColorThemeContext = createContext(null);

export function useColorTheme() {
  return useContext(ColorThemeContext);
}

export function ColorThemeProvider({ children }) {
  // 기본값: coral, 로컬스토리지에서 복원
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem("appTheme") || "coral";
  });

  const muiTheme = useMemo(
    () => createAppTheme(themeName),
    [themeName]
  );

  const handleChangeTheme = (name) => {
    setThemeName(name);
    localStorage.setItem("appTheme", name);
  };

  return (
    <ColorThemeContext.Provider value={{ themeName, setThemeName: handleChangeTheme }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorThemeContext.Provider>
  );
}
