import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/Dashboard';
import GraphTestPage from './pages/GraphTestPage';
import TemporaryAccessPassPage from './pages/TemporaryAccessPassPage';
import UserProfilePage from './pages/UserProfilePage';
import { graphService } from './services/graphService';
import { validateEnvironment } from './utils/validateEnv';

// Validate environment variables on app startup
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  // Display error to user
  if (error instanceof Error) {
    alert(`Configuration Error:\n\n${error.message}`);
  }
}

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const account = graphService.getAccount();
    if (account) {
      setUserName(account.name || account.username);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await graphService.logout();
      setUserName(undefined);
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Router>
      <Routes>
        {/* Graph Test Page - No authentication required, handles its own */}
        <Route path="/" element={<GraphTestPage />} />
        
        {/* Protected routes with layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} userName={userName}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tap" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} userName={userName}>
              <TemporaryAccessPassPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} userName={userName}>
              <UserProfilePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} userName={userName}>
              <AdminPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
