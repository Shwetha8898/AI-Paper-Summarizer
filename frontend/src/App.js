import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ChatDashboard from './pages/ChatDashboard';
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  // 🌗 Theme state
  const [theme, setTheme] = useState('dark');

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to body + save
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className={theme}>
      <BrowserRouter>
        <Routes>

          {/* Login */}
          <Route
            path="/login"
            element={
              <Login theme={theme} setTheme={setTheme} />
            }
          />

          {/* Signup */}
          <Route
            path="/signup"
            element={
              <Signup theme={theme} setTheme={setTheme} />
            }
          />

          {/* Dashboard */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <ChatDashboard theme={theme} setTheme={setTheme} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;