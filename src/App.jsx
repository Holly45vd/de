// src/App.jsx
import { HashRouter as Router, Routes, Route } from "react-router-dom"; 
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// ✅ AuthContext
import { AuthProvider } from "./context/AuthContext";

// ✅ 페이지 import
import HomePage from "./pages/HomePage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import DiaryEditor from "./pages/DiaryEditor";
import DiaryDetail from "./pages/DiaryDetail";
import LoginPage from "./pages/LoginPage"; // ✅ 로그인 페이지 추가
import BottomNavMenu from "./components/BottomNavMenu";
import MoodQuoteAdminPage from "./pages/MoodQuoteAdminPage";

export default function App() {
  return (
    <Router>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
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
           <BottomNavMenu />
        </AuthProvider>
      </LocalizationProvider>
    </Router>
  );
}
