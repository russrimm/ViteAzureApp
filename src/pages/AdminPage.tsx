import React, { useState, useEffect } from 'react';
import { graphService } from '../services/graphService';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminPage: React.FC = () => {
  const [servicePrincipalId, setServicePrincipalId] = useState('');
  const [permissionName, setPermissionName] = useState('UserAuthenticationMethod.ReadWrite.All');
  const [loading, setLoading] = useState(false);
  const [loadingIdentities, setLoadingIdentities] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [spInfo, setSpInfo] = useState<any>(null);
  const [currentPermissions, setCurrentPermissions] = useState<any[]>([]);
  const [identities, setIdentities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    loadManagedIdentities();
  }, []);

  const loadManagedIdentities = async () => {
    setLoadingIdentities(true);
    setError(null);
    
    try {
      const managedIdentities = await graphService.listManagedIdentities();
      // Sort alphabetically by displayName
      const sortedIdentities = managedIdentities.sort((a, b) => 
        a.displayName.localeCompare(b.displayName)
      );
      setIdentities(sortedIdentities);
      
      if (sortedIdentities.length === 0) {
        setShowManualEntry(true);
      }
    } catch (err: any) {
      console.error('Failed to load identities:', err);
      setError(err.message || 'Failed to load managed identities');
      setShowManualEntry(true);
    } finally {
      setLoadingIdentities(false);
    }
  };

  // Filter identities based on search query
  const filteredIdentities = identities.filter(identity =>
    identity.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    identity.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    identity.appId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadCurrentPermissions = async (objectId: string) => {
    setLoadingPermissions(true);
    try {
      const permissions = await graphService.getServicePrincipalAppRoleAssignments(objectId);
      setCurrentPermissions(permissions);
    } catch (err: any) {
      console.error('Failed to load permissions:', err);
      setCurrentPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleSelectIdentity = async (objectId: string) => {
    setServicePrincipalId(objectId);
    setError(null);
    setSuccess(null);
    setSpInfo(null);
    setCurrentPermissions([]);
    setLoading(true);

    try {
      const info = await graphService.getServicePrincipalInfo(objectId);
      setSpInfo(info);
      setSuccess(`Selected service principal: ${info.displayName}`);
      
      // Load current permissions
      await loadCurrentPermissions(objectId);
    } catch (err: any) {
      setError(err.message || 'Failed to lookup service principal');
    } finally {
      setLoading(false);
    }
  };

  const handleLookupServicePrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSpInfo(null);
    setCurrentPermissions([]);
    setLoading(true);

    try {
      const info = await graphService.getServicePrincipalInfo(servicePrincipalId);
      setSpInfo(info);
      setSuccess(`Found service principal: ${info.displayName}`);
      
      // Load current permissions
      await loadCurrentPermissions(servicePrincipalId);
    } catch (err: any) {
      setError(err.message || 'Failed to lookup service principal');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await graphService.grantAppRoleToServicePrincipal(servicePrincipalId, permissionName);
      setSuccess(`Successfully granted ${permissionName} to service principal!`);
      
      // Refresh service principal info and permissions to show new permissions
      const info = await graphService.getServicePrincipalInfo(servicePrincipalId);
      setSpInfo(info);
      await loadCurrentPermissions(servicePrincipalId);
    } catch (err: any) {
      setError(err.message || 'Failed to grant permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 p-6 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheckIcon className="w-8 h-8" style={{ color: 'white' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'white' }}>
            Admin - Grant Permissions
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'white' }}>
          Grant Microsoft Graph API permissions to service principals (e.g., Logic App managed identities)
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg">
        <p className="text-sm font-semibold mb-2" style={{ color: 'white' }}>
          ℹ️ Admin Consent Required
        </p>
        <p className="text-xs text-gray-300 mb-2">
          This page requires admin-level permissions. If you just logged in, you may need to:
        </p>
        <ol className="text-xs text-gray-300 list-decimal list-inside space-y-1">
          <li><strong>Sign out and sign back in</strong> to consent to the new permissions</li>
          <li>An Azure AD admin must grant admin consent for these permissions in Azure Portal</li>
          <li>Or contact your Global Administrator / Privileged Role Administrator</li>
        </ol>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500 border-2 border-red-600 rounded-lg">
          <p className="font-bold text-lg mb-1" style={{ color: 'white' }}>❌ Error</p>
          <p className="text-sm" style={{ color: 'white' }}>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500 border-2 border-green-600 rounded-lg">
          <p className="font-bold text-lg mb-1" style={{ color: 'white' }}>✅ Success</p>
          <p className="text-sm font-semibold" style={{ color: 'white' }}>{success}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'white' }}>
          Step 1: Select Service Principal / Managed Identity
        </h2>
        
        {loadingIdentities ? (
          <p className="text-sm text-gray-300 mb-4">Loading managed identities...</p>
        ) : identities.length > 0 ? (
          <>
            <p className="text-sm text-gray-300 mb-4">
              Search and select a managed identity (Logic Apps, Function Apps, etc.)
            </p>

            <div className="mb-4">
              <label htmlFor="identitySearch" className="block text-sm font-medium mb-2" style={{ color: 'white' }}>
                Search & Select Managed Identity
              </label>
              <input
                id="identitySearch"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search by name, object ID, or app ID..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-t-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                id="identitySelect"
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectIdentity(e.target.value);
                  }
                }}
                value={servicePrincipalId}
                size={Math.min(filteredIdentities.length + 1, 8)}
                className="w-full px-3 py-2 bg-white border border-gray-300 border-t-0 rounded-b-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select from {filteredIdentities.length} result{filteredIdentities.length !== 1 ? 's' : ''} --</option>
                {filteredIdentities.map((identity) => (
                  <option key={identity.id} value={identity.id}>
                    {identity.displayName} ({identity.servicePrincipalType})
                  </option>
                ))}
              </select>
              {searchQuery && (
                <p className="text-xs text-gray-400 mt-1">
                  Showing {filteredIdentities.length} of {identities.length} identities
                </p>
              )}
              {filteredIdentities.length === 0 && searchQuery && (
                <p className="text-xs text-yellow-400 mt-1">
                  No identities match "{searchQuery}". Try a different search.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            <button
              type="button"
              onClick={() => setShowManualEntry(!showManualEntry)}
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              {showManualEntry ? 'Hide manual entry' : 'Enter Object ID manually'}
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-300 mb-4">
            No managed identities found or unable to load. Enter the Object ID manually below.
          </p>
        )}

        {(showManualEntry || identities.length === 0) && (
          <form onSubmit={handleLookupServicePrincipal} className="mt-4">
            <div className="mb-4">
              <label htmlFor="spObjectId" className="block text-sm font-medium mb-2" style={{ color: 'white' }}>
                Service Principal Object ID
              </label>
              <input
                id="spObjectId"
                type="text"
                value={servicePrincipalId}
                onChange={(e) => setServicePrincipalId(e.target.value)}
                placeholder="e.g., 12345678-1234-1234-1234-123456789012"
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !servicePrincipalId.trim()}
              className="px-6 py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'white' }}
            >
              {loading ? 'Looking up...' : 'Lookup Service Principal'}
            </button>
          </form>
        )}
      </div>

      {spInfo && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'white' }}>
            Service Principal Information
          </h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold" style={{ color: 'white' }}>Display Name:</span>{' '}
              <span className="text-gray-300">{spInfo.displayName}</span>
            </div>
            <div>
              <span className="font-semibold" style={{ color: 'white' }}>Object ID:</span>{' '}
              <span className="text-gray-300">{spInfo.id}</span>
            </div>
            <div>
              <span className="font-semibold" style={{ color: 'white' }}>Application ID:</span>{' '}
              <span className="text-gray-300">{spInfo.appId}</span>
            </div>
          </div>
        </div>
      )}

      {spInfo && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'white' }}>
            Current Permissions (App Roles)
          </h2>
          
          {loadingPermissions ? (
            <p className="text-sm text-gray-300">Loading permissions...</p>
          ) : currentPermissions.length > 0 ? (
            <div className="space-y-3">
              {currentPermissions.map((permission, index) => (
                <div key={index} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: 'white' }}>
                        {permission.appRoleValue}
                      </p>
                      <p className="text-xs text-gray-400">
                        {permission.appRoleDisplayName}
                      </p>
                    </div>
                    <span className="ml-2 px-2 py-1 bg-green-500 text-xs rounded" style={{ color: 'white' }}>
                      ✓ Granted
                    </span>
                  </div>
                  {permission.appRoleDescription && (
                    <p className="text-xs text-gray-400 mt-1">
                      {permission.appRoleDescription}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Resource: {permission.resourceDisplayName || 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg">
              <p className="text-sm" style={{ color: 'white' }}>
                ⚠️ No permissions found. This managed identity has no Graph API permissions assigned.
              </p>
            </div>
          )}
        </div>
      )}

      {spInfo && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'white' }}>
            Step 2: Grant Permission
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            Select the Microsoft Graph permission to grant to this service principal
          </p>

          <form onSubmit={handleGrantPermission}>
            <div className="mb-4">
              <label htmlFor="permission" className="block text-sm font-medium mb-2" style={{ color: 'white' }}>
                Permission (App Role)
              </label>
              <select
                id="permission"
                value={permissionName}
                onChange={(e) => setPermissionName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UserAuthenticationMethod.ReadWrite.All">
                  UserAuthenticationMethod.ReadWrite.All
                </option>
                <option value="User.ReadWrite.All">User.ReadWrite.All</option>
                <option value="Directory.ReadWrite.All">Directory.ReadWrite.All</option>
                <option value="User.Read.All">User.Read.All (Read only)</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                For TAP generation via Logic App, you need: UserAuthenticationMethod.ReadWrite.All
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'white' }}
            >
              {loading ? 'Granting Permission...' : 'Grant Permission'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg">
            <p className="text-sm font-semibold mb-2" style={{ color: 'yellow' }}>
              ⚠️ Required Permissions
            </p>
            <p className="text-xs" style={{ color: 'white' }}>
              To grant permissions to service principals, your account must have:
            </p>
            <ul className="text-xs list-disc list-inside mt-1" style={{ color: 'white' }}>
              <li>Application.ReadWrite.All</li>
              <li>AppRoleAssignment.ReadWrite.All</li>
              <li>Or Global Administrator / Privileged Role Administrator role</li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>
          💡 How to Find Service Principal Object ID
        </h3>
        <ol className="text-sm text-gray-300 list-decimal list-inside space-y-1">
          <li>Go to Azure Portal → Enterprise Applications</li>
          <li>Find your Logic App's managed identity (same name as Logic App)</li>
          <li>Click on it → Copy the "Object ID" from the Overview page</li>
          <li>Paste it in the form above</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminPage;
