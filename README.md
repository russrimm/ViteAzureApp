# IT Support Portal

A modern, professional web portal for end-user IT needs built with Vite, React, TypeScript, and TailwindCSS.

## Features

- **Temporary Access Pass**: Generate TAP for users via Microsoft Graph API
- **User Profile Management**: Update user profiles through Microsoft Graph API
- **Modern UI**: Clean, intuitive interface built with TailwindCSS v4
- **Secure Authentication**: Microsoft Authentication Library (MSAL) integration

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

3. **Direct Tailwind Classes**: Some custom components use direct Tailwind classes instead of the Button component wrapper to ensure consistent rendering

### MSAL (Microsoft Authentication Library) Configuration

1. **Async Initialization**: The MSAL instance is initialized asynchronously to prevent race conditions
2. **Popup Authentication**: Uses `loginPopup()` for a better user experience in SPA applications
3. **Token Caching**: Stores tokens in `localStorage` for persistent sessions

### Environment Variables

- All client-side environment variables **must** be prefixed with `VITE_`
- Non-prefixed variables (e.g., `AZURE_CLIENT_ID`) are only available server-side
- The app checks for `VITE_` prefixed variables at runtime

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
│   ├── Layout.tsx
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── TextArea.tsx
│   ├── Alert.tsx
│   └── LoadingSpinner.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── GraphTestPage.tsx
│   ├── TemporaryAccessPassPage.tsx
│   └── UserProfilePage.tsx
├── services/           # API services
│   └── graphService.ts
├── config/             # Configuration
│   └── config.ts
├── App.tsx             # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Features Overview

### Dashboard
- Quick access to all portal features

### Temporary Access Pass
- Search for users
- Generate time-limited access passwords
- Configurable lifetime and usage settings
- Copy TAP to clipboard

### User Profile Management
- Search for any user
- View and edit user profiles
- Update contact information
- Modify job title and department

## Security Considerations

- Never commit `.env` file to version control
- Store secrets securely in production
- Review and limit API permissions
- Implement proper error handling
- Use HTTPS in production

## Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 3
- **Routing**: React Router 7
- **Icons**: Heroicons
- **Authentication**: MSAL Browser
- **API Clients**: Axios, Microsoft Graph Client

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
