import { KeyIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { Card, CardContent, CardHeader } from '../components/Card';
import { graphService, UserProfile } from '../services/graphService';

const GraphTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const account = graphService.getAccount();
      if (account) {
        setIsAuthenticated(true);
        setAccountInfo(account);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const account = await graphService.login();
      setIsAuthenticated(true);
      setAccountInfo(account);
    } catch (err: any) {
      setError(`Login failed: ${err.message || 'Unknown error'}`);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await graphService.logout();
      setIsAuthenticated(false);
      setAccountInfo(null);
      setUserProfile(null);
    } catch (err: any) {
      setError(`Logout failed: ${err.message || 'Unknown error'}`);
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await graphService.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (err: any) {
      setError(`Failed to get profile: ${err.message || 'Unknown error'}`);
      console.error('Get profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Graph API Test</h1>
          <p className="mt-2 text-gray-600">Test Microsoft Graph API connectivity</p>
        </div>
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => navigate('/tap')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <KeyIcon className="h-5 w-5 mr-2 text-white" />
            <span className="text-white">Issue TAP</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <div className="space-y-6">
        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Authentication Status</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Status:</p>
                  <p className={`text-lg font-semibold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                    {isAuthenticated ? 'Authenticated ✓' : 'Not Authenticated ✗'}
                  </p>
                </div>
                <div>
                  {!isAuthenticated ? (
                    <button 
                      type="button"
                      onClick={handleLogin} 
                      disabled={loading}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Sign In'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loading}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Sign Out'}
                    </button>
                  )}
                </div>
              </div>

              {accountInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">Account Information:</p>
                  <div className="space-y-1 text-sm text-gray-900">
                    <p className="text-gray-900"><strong className="text-gray-900">Name:</strong> {accountInfo.name || 'N/A'}</p>
                    <p className="text-gray-900"><strong className="text-gray-900">Username:</strong> {accountInfo.username || 'N/A'}</p>
                    <p className="text-gray-900"><strong className="text-gray-900">Environment:</strong> {accountInfo.environment || 'N/A'}</p>
                    <p className="text-gray-900"><strong className="text-gray-900">Tenant ID:</strong> {accountInfo.tenantId || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Check */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Configuration</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Client ID:</span>
                <span className="text-gray-600">
                  {(import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.AZURE_CLIENT_ID) ? 
                    `${((import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.AZURE_CLIENT_ID) ?? '').substring(0, 8)}...` : 
                    '❌ Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Tenant ID:</span>
                <span className="text-gray-600">
                  {(import.meta.env.VITE_AZURE_TENANT_ID || import.meta.env.AZURE_TENANT_ID) ? 
                    `${((import.meta.env.VITE_AZURE_TENANT_ID || import.meta.env.AZURE_TENANT_ID) ?? '').substring(0, 8)}...` : 
                    '❌ Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Redirect URI:</span>
                <span className="text-gray-600">
                  {import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Profile Test */}
        {isAuthenticated && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Graph API Test</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
<button 
                    type="button"
                    onClick={handleGetProfile} 
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : 'Get My Profile from Graph API'}
                  </button>

                {userProfile && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">✓ Profile Retrieved Successfully:</p>
                    <div className="space-y-1 text-sm text-green-900">
                      <p><strong>Display Name:</strong> {userProfile.displayName}</p>
                      <p><strong>Email:</strong> {userProfile.mail || userProfile.userPrincipalName}</p>
                      <p><strong>Job Title:</strong> {userProfile.jobTitle || 'N/A'}</p>
                      <p><strong>Department:</strong> {userProfile.department || 'N/A'}</p>
                      <p><strong>Office:</strong> {userProfile.officeLocation || 'N/A'}</p>
                      <p><strong>Mobile:</strong> {userProfile.mobilePhone || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Setup Instructions</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">1. Register an Azure AD Application</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                  <li>Go to <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Azure Portal</a></li>
                  <li>Navigate to Azure Active Directory → App registrations</li>
                  <li>Click "New registration"</li>
                  <li>Name: "IT Support Portal" (or your choice)</li>
                  <li>Supported account types: Choose based on your needs</li>
                  <li>Redirect URI: Select "Single-page application (SPA)" and enter: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5173</code></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">2. Configure API Permissions</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                  <li>Go to "API permissions" in your app</li>
                  <li>Add permissions: Microsoft Graph → Delegated permissions</li>
                  <li>Add: <code className="bg-gray-100 px-1 rounded">User.Read</code></li>
                  <li>Add: <code className="bg-gray-100 px-1 rounded">User.ReadWrite</code></li>
                  <li>Add: <code className="bg-gray-100 px-1 rounded">User.ReadBasic.All</code></li>
                  <li>Add: <code className="bg-gray-100 px-1 rounded">UserAuthenticationMethod.ReadWrite.All</code></li>
                  <li>Add: <code className="bg-gray-100 px-1 rounded">Application.ReadWrite.All</code> (for Admin page)</li>
                  <li>Add: <code className="bg-gray-100 px-1 rounded">AppRoleAssignment.ReadWrite.All</code> (for Admin page)</li>
                  <li>Click "Grant admin consent" (requires Global Administrator)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Update .env File</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                  <li>Copy the Application (client) ID from Overview</li>
                  <li>Copy the Directory (tenant) ID from Overview</li>
                  <li>Update your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file with these values</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Configure Logic App (Optional - for TAP via Logic App)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                  <li>Enable System-assigned Managed Identity in your Logic App (Identity → System assigned → On)</li>
                  <li>Copy the Object ID from the Logic App's Identity page</li>
                  <li>Navigate to the <strong>/admin</strong> page in this application</li>
                  <li>Search for your Logic App's managed identity using the search box</li>
                  <li>Select it from the dropdown list</li>
                  <li>Choose <code className="bg-gray-100 px-1 rounded">UserAuthenticationMethod.ReadWrite.All</code> permission</li>
                  <li>Click "Grant Permission" to allow the Logic App to call Graph API</li>
                  <li>Alternatively: In Azure Portal, go to Logic App → Identity → Azure role assignments → Grant Graph API permissions manually</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After updating .env, restart the dev server with <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GraphTestPage;
