// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { ColorThemeProvider } from "./context/ColorThemeContext";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./styles/theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <ThemeProvider theme={theme}>
        <ColorThemeProvider>
      <CssBaseline />
      <App />
          </ColorThemeProvider>
    </ThemeProvider>
  </ErrorBoundary>
);