import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/Dashboard';
import GraphTestPage from './pages/GraphTestPage';
import TemporaryAccessPassPage from './pages/TemporaryAccessPassPage';
import UserProfilePage from './pages/UserProfilePage';
import { graphService } from './services/graphService';

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
        
        {/* Other pages with layout */}
        <Route path="/dashboard" element={
          <Layout onLogout={handleLogout} userName={userName}>
            <Dashboard />
          </Layout>
        } />

        <Route path="/tap" element={
          <Layout onLogout={handleLogout} userName={userName}>
            <TemporaryAccessPassPage />
          </Layout>
        } />
        <Route path="/profile" element={
          <Layout onLogout={handleLogout} userName={userName}>
            <UserProfilePage />
          </Layout>
        } />
        <Route path="/admin" element={
          <Layout onLogout={handleLogout} userName={userName}>
            <AdminPage />
          </Layout>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
