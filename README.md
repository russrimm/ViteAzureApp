# IT Support Portal

A modern, professional web portal for end-user IT needs built with Vite, React, TypeScript, and TailwindCSS.

## Table of Contents

- [Features](#features)
- [Build This Application From Scratch](#build-this-application-from-scratch)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Logic App Configuration](#logic-app-configuration-for-tap-via-logic-app)
- [Key Implementation Changes](#key-implementation-changes)
- [Project Structure](#project-structure)
- [Features Overview](#features-overview)
- [Security Considerations](#security-considerations)
- [Technologies Used](#technologies-used)

## Features

- **Temporary Access Pass**: Generate TAP for users via Microsoft Graph API
- **User Profile Management**: Update user profiles through Microsoft Graph API
- **Admin Permission Management**: Grant Graph API permissions to managed identities (Logic Apps, Function Apps)
- **Modern UI**: Clean, intuitive interface built with TailwindCSS v4
- **Secure Authentication**: Microsoft Authentication Library (MSAL) integration
- **Route Protection**: Automatic authentication enforcement on protected pages
- **Environment Validation**: Startup validation of required Azure credentials
- **Accessibility**: ARIA labels and keyboard navigation support

---

## Build This Application From Scratch

This comprehensive guide will walk you through creating this entire IT Support Portal from the ground up, including all prerequisites, dependencies, and configurations.

### Step 1: Install Node.js and npm

**Windows:**
1. Download Node.js LTS (Long Term Support) from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer (e.g., `node-v24.x.x-x64.msi`)
3. Follow the installation wizard, accepting defaults
4. Open **Command Prompt** or **PowerShell** and verify:
   ```bash
   node --version   # Should show v18.x.x or higher
   npm --version    # Should show 9.x.x or higher
   ```

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify installation
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Create a New Vite + React + TypeScript Project

```bash
# Create project (select React + TypeScript when prompted)
npm create vite@latest vite-azure-app -- --template react-ts

# Navigate into project
cd vite-azure-app

# Install base dependencies
npm install
```

### Step 3: Install Required Dependencies

```bash
# Authentication & Microsoft Graph
npm install @azure/msal-browser@^4.27.0
npm install @microsoft/microsoft-graph-client@^3.0.7

# UI Libraries
npm install react-router-dom@^7.10.1
npm install @heroicons/react@^2.2.0
npm install @headlessui/react@^2.2.9

# HTTP Client
npm install axios@^1.13.2

# TailwindCSS v4 (PostCSS-based)
npm install -D tailwindcss@^4.1.18
npm install -D @tailwindcss/postcss@^4.1.18
npm install -D postcss@^8.5.6
npm install -D autoprefixer@^10.4.23

# TypeScript & ESLint
npm install -D @types/react@^18.3.18
npm install -D @types/react-dom@^18.3.5
npm install -D @typescript-eslint/eslint-plugin@^8.18.2
npm install -D @typescript-eslint/parser@^8.18.2
npm install -D eslint@^9.17.0
npm install -D eslint-plugin-react-hooks@^5.0.0
npm install -D eslint-plugin-react-refresh@^0.4.16
```

### Step 4: Configure TailwindCSS v4

**Create `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

**Create `postcss.config.js`:**

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**Update `src/index.css`:**

```css
@import "tailwindcss";

/* Your custom CSS here */
```

### Step 5: Configure Vite

**Update `vite.config.ts`:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### Step 6: Set Up Entra ID App Registration

1. **Go to Azure Portal:**
   - Navigate to [https://portal.azure.com](https://portal.azure.com)
   - Go to **Microsoft Entra ID** → **App registrations**

2. **Create New Registration:**
   - Click **"New registration"**
   - **Name**: `IT Support Portal`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Select `Single-page application (SPA)` and enter `http://localhost:5173`
   - Click **Register**

3. **Configure API Permissions:**
   - Go to **API permissions** in your app registration
   - Click **"Add a permission"** → **Microsoft Graph** → **Delegated permissions**
   - Add these permissions:
     - `User.ReadWrite`
     - `User.ReadBasic.All`
     - `UserAuthenticationMethod.ReadWrite.All`
     - `Application.ReadWrite.All`
     - `AppRoleAssignment.ReadWrite.All`
   - Click **"Grant admin consent for [Your Organization]"** (requires Global Admin)

4. **Copy Credentials:**
   - From the **Overview** page, copy:
     - **Application (client) ID**
     - **Directory (tenant) ID**

### Step 7: Create Environment Configuration

**Create `.env` file in project root:**

```env
VITE_AZURE_CLIENT_ID=your-application-client-id-here
VITE_AZURE_TENANT_ID=your-directory-tenant-id-here
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

**Create `.env.example` (for documentation):**

```env
VITE_AZURE_CLIENT_ID=
VITE_AZURE_TENANT_ID=
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

**Update `.gitignore` to exclude `.env`:**

```
# Environment variables
.env
.env.local
.env.*.local
```

### Step 8: Create Configuration Files

**Create `src/config/config.ts`:**

```typescript
// Environment configuration
export const config = {
  azure: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
    clientSecret: import.meta.env.VITE_AZURE_CLIENT_SECRET || '',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || `${window.location.origin}`,
  },
};
```

### Step 9: Create Microsoft Graph Service

**Create `src/services/graphService.ts`:**

```typescript
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { config } from '../config/config';

// MSAL Configuration
const msalConfig = {
  auth: {
    clientId: config.azure.clientId,
    authority: `https://login.microsoftonline.com/${config.azure.tenantId}`,
    redirectUri: config.azure.redirectUri,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

// Request scopes
const loginRequest = {
  scopes: [
    'User.ReadWrite',
    'User.ReadBasic.All',
    'UserAuthenticationMethod.ReadWrite.All',
    'Application.ReadWrite.All',
    'AppRoleAssignment.ReadWrite.All'
  ],
};

export interface UserProfile {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
}

export interface TemporaryAccessPass {
  temporaryAccessPass: string;
  lifetimeInMinutes: number;
  isUsableOnce: boolean;
}

class GraphService {
  private msalInstance: PublicClientApplication | null = null;
  private graphClient: Client | null = null;

  async initialize(): Promise<void> {
    if (this.msalInstance) return;

    this.msalInstance = new PublicClientApplication(msalConfig);
    await this.msalInstance.initialize();
  }

  async login(): Promise<void> {
    await this.initialize();
    await this.msalInstance!.loginPopup(loginRequest);
  }

  async logout(): Promise<void> {
    await this.initialize();
    await this.msalInstance!.logoutPopup();
  }

  async getAccessToken(): Promise<string> {
    await this.initialize();
    const accounts = this.msalInstance!.getAllAccounts();
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please sign in.');
    }

    try {
      const response = await this.msalInstance!.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        const response = await this.msalInstance!.acquireTokenPopup(loginRequest);
        return response.accessToken;
      }
      throw error;
    }
  }

  private async getGraphClient(): Promise<Client> {
    if (!this.graphClient) {
      const token = await this.getAccessToken();
      this.graphClient = Client.init({
        authProvider: (done) => {
          done(null, token);
        },
      });
    }
    return this.graphClient;
  }

  async getUserProfile(): Promise<UserProfile> {
    const client = await this.getGraphClient();
    const profile = await client.api('/me').get();
    return profile;
  }

  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    const client = await this.getGraphClient();
    const response = await client
      .api('/users')
      .filter(`startswith(displayName,'${searchTerm}') or startswith(userPrincipalName,'${searchTerm}')`)
      .select('id,displayName,mail,userPrincipalName,jobTitle,department')
      .top(10)
      .get();
    return response.value;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const client = await this.getGraphClient();
    await client.api(`/users/${userId}`).update(updates);
  }

  async createTemporaryAccessPass(
    userId: string,
    lifetimeInMinutes: number = 60,
    isUsableOnce: boolean = true
  ): Promise<TemporaryAccessPass> {
    const client = await this.getGraphClient();
    const tap = await client
      .api(`/users/${userId}/authentication/temporaryAccessPassMethods`)
      .post({
        lifetimeInMinutes,
        isUsableOnce,
      });
    return tap;
  }

  async listServicePrincipals(): Promise<any[]> {
    const client = await this.getGraphClient();
    const response = await client
      .api('/servicePrincipals')
      .select('id,appId,displayName,servicePrincipalType')
      .top(999)
      .get();
    return response.value;
  }

  async listManagedIdentities(): Promise<any[]> {
    const allSPs = await this.listServicePrincipals();
    return allSPs.filter(sp => sp.servicePrincipalType === 'ManagedIdentity');
  }

  async getServicePrincipalAppRoleAssignments(servicePrincipalId: string): Promise<any[]> {
    const client = await this.getGraphClient();
    const response = await client
      .api(`/servicePrincipals/${servicePrincipalId}/appRoleAssignments`)
      .get();
    
    const assignments = response.value;
    
    // Enrich with role and resource details
    for (const assignment of assignments) {
      try {
        const resourceSP = await client
          .api(`/servicePrincipals/${assignment.resourceId}`)
          .select('displayName,appRoles')
          .get();
        
        assignment.resourceDisplayName = resourceSP.displayName;
        
        const role = resourceSP.appRoles?.find((r: any) => r.id === assignment.appRoleId);
        if (role) {
          assignment.appRoleName = role.value;
          assignment.appRoleDescription = role.description;
        }
      } catch (err) {
        console.error('Error enriching assignment:', err);
      }
    }
    
    return assignments;
  }

  async grantAppRoleToServicePrincipal(
    servicePrincipalId: string,
    resourceServicePrincipalId: string,
    appRoleId: string
  ): Promise<void> {
    const client = await this.getGraphClient();
    await client
      .api(`/servicePrincipals/${servicePrincipalId}/appRoleAssignments`)
      .post({
        principalId: servicePrincipalId,
        resourceId: resourceServicePrincipalId,
        appRoleId: appRoleId,
      });
  }

  isAuthenticated(): boolean {
    return this.msalInstance?.getAllAccounts().length ?? 0 > 0;
  }
}

export const graphService = new GraphService();
```

### Step 10: Create Reusable Components

**Create `src/components/Layout.tsx`:**

```typescript
import { NavLink, Outlet } from 'react-router-dom';
import { 
  HomeIcon, 
  KeyIcon, 
  UserCircleIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { graphService } from '../services/graphService';
import { useState } from 'react';

const Layout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await graphService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigation = [
    { name: 'Home', to: '/', icon: HomeIcon },
    { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
    { name: 'Temporary Access Pass', to: '/tap', icon: KeyIcon },
    { name: 'User Profile', to: '/profile', icon: UserCircleIcon },
    { name: 'Admin', to: '/admin', icon: ShieldCheckIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">IT Support Portal</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
```

**Create `src/components/Card.tsx`:**

```typescript
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`px-4 py-5 sm:px-6 ${className}`}>{children}</div>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`px-4 py-5 sm:p-6 ${className}`}>{children}</div>;
};
```

**Create `src/components/LoadingSpinner.tsx`:**

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600`}
      />
    </div>
  );
};

export default LoadingSpinner;
```

**Create `src/components/Alert.tsx`:**

```typescript
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      icon: CheckCircleIcon,
      iconColor: 'text-green-400',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-400',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-400',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-400',
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} border-l-4 p-4 rounded`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${style.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-medium ${style.text}`}>{title}</h3>}
          <div className={`text-sm ${style.text} ${title ? 'mt-2' : ''}`}>
            <p>{message}</p>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 ${style.text} hover:bg-${type}-100 focus:outline-none focus:ring-2 focus:ring-${type}-600`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
```

### Step 11: Create Page Components

**Create `src/pages/GraphTestPage.tsx`:**

```typescript
import { useState } from 'react';
import { graphService, UserProfile } from '../services/graphService';
import LoadingSpinner from '../components/LoadingSpinner';

const GraphTestPage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await graphService.login();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGetProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await graphService.getUserProfile();
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Microsoft Graph API Test</h1>
      
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          style={{ color: 'white' }}
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
        </button>

        <button
          onClick={handleGetProfile}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          style={{ color: 'white' }}
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Get My Profile'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {profile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Profile Information:</h2>
            <pre className="text-sm">{JSON.stringify(profile, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphTestPage;
```

**Create `src/pages/Dashboard.tsx`:**

```typescript
import { Link } from 'react-router-dom';
import { KeyIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '../components/Card';

const Dashboard = () => {
  const features = [
    {
      title: 'Temporary Access Pass',
      description: 'Generate time-limited access passwords for users',
      icon: KeyIcon,
      link: '/tap',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'User Profile Management',
      description: 'View and edit user profile information',
      icon: UserCircleIcon,
      link: '/profile',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Admin',
      description: 'Grant Graph API permissions to managed identities',
      icon: ShieldCheckIcon,
      link: '/admin',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Select a tool to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link key={feature.title} to={feature.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className={`${feature.bgColor} rounded-lg p-3 w-12 h-12 flex items-center justify-center`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
```

**Note:** Due to the complexity and length of the remaining pages (TemporaryAccessPassPage.tsx, UserProfilePage.tsx, AdminPage.tsx), refer to the existing source files in this repository for the complete implementation. Each page follows similar patterns using the components and services created above.

### Step 12: Set Up Routing

**Update `src/App.tsx`:**

```typescript
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
  if (error instanceof Error) {
    alert(`Configuration Error:\n\n${error.message}`);
  }
}

function App() {
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
        <Route path="/" element={<GraphTestPage />} />
        
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
}

export default App;
```
      <Routes>
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<GraphTestPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tap" element={<TemporaryAccessPassPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
        <Route path="/login" element={<GraphTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**Update `src/main.tsx`:**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 13: Test the Application

```bash
# Start development server
npm run dev
```

The application should open at `http://localhost:5173`. Test the authentication flow:

1. Click "Sign In"
2. Authenticate with your Microsoft account
3. Grant the requested permissions
4. Navigate through the portal features

**Note:** If environment variables are missing or invalid, you'll see a validation error on startup. The application automatically validates:
- All required environment variables are present
- Client ID and Tenant ID are valid GUIDs
- Redirect URI is a valid URL

**Route Protection:** After authentication, you can access protected routes:
- `/dashboard` - Main dashboard
- `/tap` - Temporary Access Pass generation
- `/profile` - User profile management
- `/admin` - Permission management for managed identities

Unauthenticated users attempting to access protected routes are automatically redirected to the home page.

### Step 14: Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

The production files will be in the `dist/` directory.

### Step 15: Deploy to Azure (Optional)

**Deploy to Azure Static Web Apps:**

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Build the app
npm run build

# Deploy (follow prompts)
swa deploy ./dist --env production
```

**Deploy to Azure App Service:**

```bash
# Install Azure CLI
# Windows: Download from https://aka.ms/installazurecliwindows
# macOS: brew install azure-cli
# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name it-support-portal-rg --location eastus

# Create App Service plan
az appservice plan create --name it-support-portal-plan --resource-group it-support-portal-rg --sku FREE

# Create web app
az webapp create --name it-support-portal --resource-group it-support-portal-rg --plan it-support-portal-plan

# Deploy
az webapp deployment source config-zip --resource-group it-support-portal-rg --name it-support-portal --src dist.zip
```

### Troubleshooting Common Issues

**Issue: MSAL "AADSTS50011: The redirect URI specified in the request does not match"**
- Solution: Ensure the redirect URI in Azure AD matches exactly what's in your `.env` file

**Issue: "Failed to fetch" errors when calling Graph API**
- Solution: Verify API permissions are granted and admin consent was provided

**Issue: TailwindCSS classes not applying**
- Solution: Ensure `postcss.config.js` uses `@tailwindcss/postcss` and `index.css` uses `@import "tailwindcss"`

**Issue: TypeScript errors on build**
- Solution: Run `npm run lint` to identify and fix type errors

**Issue: Environment variables undefined**
- Solution: All client-side vars must be prefixed with `VITE_`

---

## Prerequisites

- Node.js 18+ and npm
- Azure AD app registration with appropriate permissions

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Azure AD Application

**Register Application in Azure Portal:**

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations**
2. Click **"New registration"**
3. Fill in:
   - **Name**: "IT Support Portal" (or your choice)
   - **Supported account types**: Choose based on your organization needs
   - **Redirect URI**: 
     - Type: **Single-page application (SPA)**
     - URI: `http://localhost:5173`
4. Click **Register**

**Configure API Permissions:**

1. In your app registration, go to **API permissions**
2. Click **"Add a permission"** → **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `User.ReadWrite` (includes User.Read)
   - `User.ReadBasic.All` (to search other users)
   - `UserAuthenticationMethod.ReadWrite.All`
   - `Application.ReadWrite.All` (for admin features - includes read access)
   - `AppRoleAssignment.ReadWrite.All` (for granting permissions)
4. Click **"Grant admin consent"** (requires Global Administrator role)

**Get Your Credentials:**

1. Go to **Overview** page
2. Copy the **Application (client) ID**
3. Copy the **Directory (tenant) ID**

## Logic App Configuration (for TAP via Logic App)

If you're using the Logic App integration for TAP generation:

### 1. Enable System-Assigned Managed Identity

1. Go to your Logic App in Azure Portal
2. Navigate to **Identity** (under Settings)
3. Set **Status** to **On** for System-assigned managed identity
4. Click **Save**

### 2. Grant Microsoft Graph API Permissions

**Option A: Using the Admin Page (Recommended)**

1. Navigate to `/admin` in the application
2. Use the search box to find your Logic App's managed identity
3. Select it from the dropdown
4. Choose `UserAuthenticationMethod.ReadWrite.All` permission
5. Click **Grant Permission**

**Option B: Using Azure Portal**

1. Stay on the Logic App's **Identity** page
2. Click **Azure role assignments** button
3. Click **+ Add role assignment**
4. Select:
   - **Scope**: Subscription or Resource Group
   - **Role**: Appropriate role (not for Microsoft Graph API permissions)

**IMPORTANT**: For Microsoft Graph API permissions specifically:
1. From the Logic App's **Identity** page, copy the **Object ID**
2. Go to **Azure Active Directory** → **Enterprise Applications**
3. Find your Logic App by the Object ID
4. Go to **Permissions**
5. Click **Add permission** → **Microsoft Graph** → **Application permissions**
6. Select `UserAuthenticationMethod.ReadWrite.All`
7. Click **Grant admin consent**

Alternatively, use the `/admin` page in the application which automates this process.

### 3. Update Logic App Workflow

Ensure your Logic App HTTP trigger is configured to accept POST requests with the user's Entra Object ID:

```json
{
  "entraObjectId": "<user-object-id>"
}
```

### Troubleshooting 403 Errors

If you receive a 403 "Request Authorization failed" error when issuing TAP via Logic App:

1. Verify the Logic App's managed identity has `UserAuthenticationMethod.ReadWrite.All` permission
2. Check that admin consent was granted for the permission
3. Wait a few minutes for permissions to propagate
4. Use the `/admin` page to verify current permissions are correctly assigned

### 3. Configure Environment Variables

**IMPORTANT**: Vite only exposes environment variables prefixed with `VITE_` to the browser.

Create a `.env` file in the project root:

```env
# Azure AD / Microsoft Graph Configuration (REQUIRED)
VITE_AZURE_CLIENT_ID=your-application-client-id
VITE_AZURE_TENANT_ID=your-directory-tenant-id
VITE_AZURE_REDIRECT_URI=http://localhost:5173
```

**Replace the placeholder values** with your actual Azure AD credentials from step 2.

### 4. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

**Environment Validation:** If you see an error alert on startup, check that:
- Your `.env` file exists in the project root
- All required variables are set: `VITE_AZURE_CLIENT_ID`, `VITE_AZURE_TENANT_ID`, `VITE_AZURE_REDIRECT_URI`
- Client ID and Tenant ID are valid GUIDs (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- Redirect URI is a valid URL

### 5. Test Authentication

1. You'll see the **Graph API Test** page
2. Click the **"Sign In"** button
3. A Microsoft login popup will appear
4. Sign in with your Microsoft/Entra ID credentials
5. Grant consent to the requested permissions
6. Once authenticated, click **"Get My Profile from Graph API"** to verify the connection

## Key Implementation Changes

### TailwindCSS v4 Configuration

This project uses **TailwindCSS v4** which has a different setup than v3:

1. **PostCSS Plugin**: Uses `@tailwindcss/postcss` instead of `tailwindcss`
   ```javascript
   // postcss.config.js
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   }
   ```

2. **CSS Import**: Uses `@import` instead of `@tailwind` directives
   ```css
   /* src/index.css */
   @import "tailwindcss";
   ```

3. **Direct Tailwind Classes**: All components use direct Tailwind classes for consistency and maintainability (no inline styles)

### MSAL (Microsoft Authentication Library) Configuration

1. **Async Initialization**: The MSAL instance is initialized asynchronously to prevent race conditions
2. **Popup Authentication**: Uses `loginPopup()` for a better user experience in SPA applications
3. **Token Caching**: Stores tokens in `localStorage` for persistent sessions

### Environment Variables & Validation

- All client-side environment variables **must** be prefixed with `VITE_`
- Non-prefixed variables (e.g., `AZURE_CLIENT_ID`) are only available server-side
- The app validates environment variables on startup (`src/utils/validateEnv.ts`):
  - Checks that all required variables are present
  - Validates GUID format for Client ID and Tenant ID
  - Validates Redirect URI is a valid URL
  - Displays clear error messages if validation fails

### Route Protection

All routes except the home page (`/`) are protected with the `ProtectedRoute` component:

- `/dashboard` - Main dashboard
- `/tap` - Temporary Access Pass generation
- `/profile` - User profile management  
- `/admin` - Admin permission management

Unauthenticated users are automatically redirected to the home page to sign in.

### Code Quality & Accessibility

- **No Inline Styles**: All styling uses Tailwind CSS classes
- **ARIA Labels**: Interactive elements include proper ARIA labels for screen readers
- **TypeScript**: Full type safety throughout the application
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── Card.tsx        # Card component
│   ├── Alert.tsx       # Alert/notification component
│   ├── LoadingSpinner.tsx  # Loading indicator
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── GraphTestPage.tsx  # Home/login page
│   ├── TemporaryAccessPassPage.tsx  # TAP generation
│   ├── UserProfilePage.tsx  # User profile management
│   └── AdminPage.tsx   # Admin permission management
├── services/           # API services
│   └── graphService.ts  # Microsoft Graph API client
├── config/             # Configuration
│   └── config.ts       # Environment config
├── utils/              # Utility functions
│   └── validateEnv.ts  # Environment validation
├── App.tsx             # Main app component with routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Features Overview

### Dashboard
- Quick access to all portal features
- Clean card-based navigation

### Temporary Access Pass
- Search for users by name or email
- Generate time-limited access passwords
- Configurable lifetime and usage settings
- Copy TAP to clipboard
- Logic App integration support

### User Profile Management
- Search for any user in the organization
- View and edit user profiles
- Update contact information
- Modify job title and department

### Admin Permission Management
- Grant Microsoft Graph API permissions to managed identities
- Search and select Logic Apps, Function Apps, and other managed identities
- View current permissions assigned to service principals
- Resolve 403 errors from Logic App TAP generation
- Support for multiple Graph API permission types

## Security Considerations

- **Environment Variables**: Never commit `.env` file to version control - it's excluded via `.gitignore`
- **Environment Validation**: Automatic validation on startup prevents running with invalid configuration
- **Route Protection**: All sensitive pages require authentication
- **Token Security**: MSAL handles secure token storage and automatic refresh
- **API Permissions**: Follow principle of least privilege - only request necessary permissions
- **Production Deployment**: Always use HTTPS in production environments
- **Admin Consent**: Ensure admin consent is granted for all required Graph API permissions
- **Error Handling**: Comprehensive error handling prevents sensitive data exposure

## Technologies Used

- **Frontend Framework**: React 18.3.1 with TypeScript 5.7.2
- **Build Tool**: Vite 6.0.3
- **Styling**: TailwindCSS 4.1.18 (PostCSS-based)
- **Routing**: React Router 7.10.1
- **Icons**: Heroicons 2.2.0
- **Authentication**: MSAL Browser 4.27.0
- **API Clients**: Microsoft Graph Client 3.0.7, Axios 1.13.2
- **UI Components**: Headless UI 2.2.9

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Recent Improvements (January 2026)

### Security Enhancements
- ✅ Environment variable validation on startup with helpful error messages
- ✅ Protected routes with automatic authentication enforcement
- ✅ GUID format validation for Azure credentials
- ✅ URL validation for redirect URIs

### Code Quality
- ✅ Removed all inline styles in favor of Tailwind CSS classes
- ✅ Improved maintainability and consistency
- ✅ Better bundle size optimization

### Accessibility
- ✅ Added ARIA labels to interactive elements
- ✅ Improved keyboard navigation support
- ✅ Screen reader friendly components

### Developer Experience
- ✅ Clear error messages for configuration issues
- ✅ Comprehensive documentation
- ✅ Complete TypeScript coverage
