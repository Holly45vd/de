// src/App.jsx
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// ✅ AuthContext
import { AuthProvider } from "./context/AuthContext";

// ✅ 페이지 import
import HomePage from "./pages/HomePage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import DiaryEditor from "./pages/DiaryEditor";
import DiaryDetail from "./pages/DiaryDetail";
import LoginPage from "./pages/LoginPage";
import BottomNavMenu from "./components/BottomNavMenu";
import MoodQuoteAdminPage from "./pages/MoodQuoteAdminPage";

// ✅ MUI Theme 설정
const theme = createTheme({
  palette: {
    primary: {
      main: "#45C4B0",
    },
    text: {
      primary: "#333",
    },
  },
  typography: {
    fontFamily: "'Orbit', 'Hi Melody', 'Gaegu', sans-serif",
  },
});

export default function App() {
  return (
  // src/App.jsx
<Router>
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/editor" element={<DiaryEditor />} />
            <Route path="/diary/:id" element={<DiaryDetail />} />
            <Route path="/diary/edit/:id" element={<DiaryEditor />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<MoodQuoteAdminPage />} />
          </Routes>
        </div>
        <BottomNavMenu />
      </AuthProvider>
    </ThemeProvider>
  </LocalizationProvider>
</Router>

  );
}
