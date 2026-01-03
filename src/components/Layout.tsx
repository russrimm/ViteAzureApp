import {
    ArrowRightOnRectangleIcon,
    HomeIcon,
    KeyIcon,
    ShieldCheckIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, userName }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Temporary Access Pass', href: '/tap', icon: KeyIcon },
    { name: 'User Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Admin', href: '/admin', icon: ShieldCheckIcon },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col grow bg-primary-700 overflow-y-auto">
          <div className="flex items-center shrink-0 px-4 py-5 bg-primary-800">
            <h1 className="text-2xl font-bold text-white">IT Support Portal</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-primary-800 text-white'
                        : 'text-primary-100 hover:bg-primary-600'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                  >
                    <Icon className="mr-3 h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          {userName && (
            <div className="shrink-0 flex border-t border-primary-800 p-4">
              <div className="flex items-center w-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-primary-200">Signed in</p>
                </div>
                {onLogout && (
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

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
