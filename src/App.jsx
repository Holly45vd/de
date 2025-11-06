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
import LoginPage from "./pages/LoginPage";
import BottomNavMenu from "./components/BottomNavMenu";
import MoodQuoteAdminPage from "./pages/MoodQuoteAdminPage";
import PrivateRoute from "./components/PrivateRoute"; // 로그인 가드

// ⚠️ 테마는 main.jsx에서만 주입합니다. (여기선 ThemeProvider, createTheme 제거)

export default function App() {
  return (
    <Router>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
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

          {/* 하단 네비게이션: 로그인 화면에서도 항상 보일 필요가 없다면,
              BottomNavMenu를 PrivateRoute로 감싸서 로그인 후에만 보이게 할 수도 있음 */}
          <BottomNavMenu />
        </AuthProvider>
      </LocalizationProvider>
    </Router>
  );
}
