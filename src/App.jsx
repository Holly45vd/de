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
import PrivateRoute from "./components/PrivateRoute"; // 추가

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
    <Router>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <div className="container">
              <Routes>
                {/* 로그인 없이 접근 가능 */}
                <Route path="/login" element={<LoginPage />} />

                {/* 로그인 필요 */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <HomePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/home"
                  element={
                    <PrivateRoute>
                      <HomePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <PrivateRoute>
                      <CalendarPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/editor"
                  element={
                    <PrivateRoute>
                      <DiaryEditor />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/diary/:id"
                  element={
                    <PrivateRoute>
                      <DiaryDetail />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/diary/edit/:id"
                  element={
                    <PrivateRoute>
                      <DiaryEditor />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <MoodQuoteAdminPage />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
            <BottomNavMenu />
          </AuthProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </Router>
  );
}
