// React imports
import React, { useEffect, useState } from 'react';
// React Router imports for navigation between pages
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
// Component imports
import Layout from './components/Layout';              // The sidebar and header wrapper
import { ProtectedRoute } from './components/ProtectedRoute';  // Guards pages that need authentication
// Page components
import AdminPage from './pages/AdminPage';
import Dashboard from './pages/Dashboard';
import GraphTestPage from './pages/GraphTestPage';
import TemporaryAccessPassPage from './pages/TemporaryAccessPassPage';
import UserProfilePage from './pages/UserProfilePage';
// Services and utilities
import { graphService } from './services/graphService';  // Handles Microsoft Graph API calls
import { validateEnvironment } from './utils/validateEnv';  // Checks .env file is configured

// Validate environment variables when the app first loads
// This runs ONCE when the file is imported, before any components render
try {
  validateEnvironment();  // Check if .env has all required Azure credentials
} catch (error) {
  console.error('Environment validation failed:', error);
  // Display error to user in a popup alert
  if (error instanceof Error) {
    alert(`Configuration Error:\n\n${error.message}`);
  }
}

/**
 * App Component - The main component that sets up routing for the entire application
 * 
 * This component:
 * 1. Manages the user's login state (their name)
 * 2. Sets up all the routes (URLs) for different pages
 * 3. Protects certain routes so only logged-in users can access them
 * 4. Handles logout functionality
 */
const App: React.FC = () => {
  // State: stores the currently logged-in user's name
  // useState creates a variable that, when changed, causes the component to re-render
  // undefined means "no user logged in yet"
  const [userName, setUserName] = useState<string | undefined>(undefined);

  // useEffect runs code after the component renders
  // The empty array [] means "run this once when the component first loads"
  useEffect(() => {
    // Check if there's already a logged-in account
    const account = graphService.getAccount();
    if (account) {
      // If user is logged in, save their name to state
      // Use account.name if available, otherwise use account.username (email)
      setUserName(account.name || account.username);
    }
  }, []);  // Empty dependency array = run once on mount

  /**
   * Handles user logout
   * This function is passed to child components so they can trigger logout
   */
  const handleLogout = async () => {
    try {
      await graphService.logout();  // Call Microsoft to sign out
      setUserName(undefined);       // Clear the user's name from state
      window.location.reload();     // Refresh the page to reset everything
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    // Router: Enables navigation between different pages without full page reloads
    <Router>
      {/* Routes: Container for all route definitions */}
      <Routes>
        {/* 
          Home Route ("/"): The login/landing page
          - NOT protected - anyone can access this
          - This is where users log in
        */}
        <Route path="/" element={<GraphTestPage />} />
        
        {/* 
          Protected Routes: All routes below require authentication
          - Wrapped in <ProtectedRoute> to check if user is logged in
          - Wrapped in <Layout> to show the sidebar and header
          - If not logged in, user is redirected to "/" (home page)
        */}
        
        {/* Dashboard page - shows quick action cards */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} userName={userName}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        {/* TAP page - generate temporary access passwords for users */}
        <Route path="/tap" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} userName={userName}>
              <TemporaryAccessPassPage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Profile page - view and edit user profiles */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} userName={userName}>
              <UserProfilePage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin page - grant API permissions to service principals */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} userName={userName}>
              <AdminPage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* 
          Catch-all route: Any URL that doesn't match above routes
          Redirects to home page ("/")
          The * wildcard matches any path
        */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
