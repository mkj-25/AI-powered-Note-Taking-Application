import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import MainLayout from './components/layout/MainLayout';
import useAuthStore from './stores/useAuthStore';

/**
 * Manages body class to switch between "scrollable landing" mode
 * and "clipped app shell" mode — does not change any UI.
 */
function BodyClassManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const isApp = pathname.startsWith('/dashboard') || pathname.startsWith('/workspace');
    if (isApp) {
      document.body.classList.add('app-mode');
    } else {
      document.body.classList.remove('app-mode');
    }
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <BodyClassManager />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected — wrapped in MainLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:workspaceId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WorkspacePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global toaster for public (landing/login) pages;
          protected pages get their Toaster inside MainLayout */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
