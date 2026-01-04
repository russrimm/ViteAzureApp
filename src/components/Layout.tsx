import {
    ArrowRightOnRectangleIcon,  // Logout icon
    HomeIcon,                    // Dashboard icon
    KeyIcon,                     // TAP (Temporary Access Pass) icon
    ShieldCheckIcon,             // Admin icon
    UserCircleIcon,              // User profile icon
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Layout Component
 * 
 * This is the main shell/frame of the app that wraps around page content
 * It provides:
 * - A sidebar navigation menu on the left
 * - User info and logout button at the bottom of the sidebar
 * - A content area on the right where pages are displayed
 * 
 * This component is used by all protected pages (dashboard, profile, etc.)
 */

// TypeScript interface: defines what props this component needs
interface LayoutProps {
  children: React.ReactNode;   // The page content to display (Dashboard, Profile, etc.)
  onLogout?: () => void;       // Optional function to call when logout is clicked
  userName?: string;           // Optional user's name to display
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, userName }) => {
  // useLocation is a React Router hook that tells us what page we're on
  const location = useLocation();

  // Array of navigation items to display in the sidebar
  // Each item has a name, URL path, and icon
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Temporary Access Pass', href: '/tap', icon: KeyIcon },
    { name: 'User Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Admin', href: '/admin', icon: ShieldCheckIcon },
  ];

  /**
   * Checks if a given path matches the current page
   * Used to highlight the active navigation item
   */
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    // Outer container: min-h-screen ensures it's at least as tall as the browser window
    <div className="min-h-screen bg-gray-50">
      
      {/* Sidebar - Fixed on the left side */}
      {/* hidden md:flex means: hide on mobile, show on medium+ screens */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col grow bg-primary-700 overflow-y-auto">
          
          {/* App Title at top of sidebar */}
          <div className="flex items-center shrink-0 px-4 py-5 bg-primary-800">
            <h1 className="text-2xl font-bold text-white">IT Support Portal</h1>
          </div>
          
          {/* Navigation Menu */}
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {/* Loop through each navigation item and create a link */}
              {navigation.map((item) => {
                const Icon = item.icon;  // Get the icon component
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    // Conditional styling: different colors if this is the current page
                    className={`${
                      isActive(item.href)
                        ? 'bg-primary-800 text-white'           // Active page: darker background
                        : 'text-primary-100 hover:bg-primary-600'  // Inactive: lighter, changes on hover
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                  >
                    {/* Icon next to the text */}
                    <Icon className="mr-3 h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User info section at bottom of sidebar */}
          {userName && (  // Only show if userName is provided
            <div className="shrink-0 flex border-t border-primary-800 p-4">
              <div className="flex items-center w-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-primary-200">Signed in</p>
                </div>
                {/* Logout button */}
                {onLogout && (  // Only show if onLogout function is provided
                  <button
                    onClick={onLogout}
                    className="ml-3 text-primary-200 hover:text-white transition-colors"
                    title="Sign out"
                  >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area - pushed to the right by the sidebar */}
      {/* md:pl-64 adds left padding on medium+ screens to make room for the fixed sidebar */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            {/* Max width container with responsive padding */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Render the page content (Dashboard, Profile, etc.) */}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
