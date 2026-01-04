// Import Navigate to redirect users to different pages
import { Navigate } from 'react-router-dom';
// Import graphService to check if user is logged in
import { graphService } from '../services/graphService';

// TypeScript interface: defines what props this component accepts
interface ProtectedRouteProps {
  children: React.ReactNode;  // React.ReactNode means "any valid React content" (components, text, etc.)
}

/**
 * ProtectedRoute Component
 * 
 * This is a "guard" component that protects pages requiring authentication.
 * How it works:
 * 1. Check if the user is logged in (authenticated)
 * 2. If YES: Show the page (render children)
 * 3. If NO: Redirect them to the home page to log in
 * 
 * Usage example:
 * <ProtectedRoute>
 *   <AdminPage />
 * </ProtectedRoute>
 * 
 * The AdminPage will only show if user is logged in
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Check authentication status by calling graphService
  const isAuthenticated = graphService.isAuthenticated();

  // If not logged in, redirect to home page ("/")
  // The "replace" prop means don't add this redirect to browser history
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected content
  // <> and </> are React fragments - they group elements without adding extra HTML
  return <>{children}</>;
};
