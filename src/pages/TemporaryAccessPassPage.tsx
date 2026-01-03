import { CheckCircleIcon, ClockIcon, KeyIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import Alert from '../components/Alert';
import { Card, CardContent, CardHeader } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { graphService, TemporaryAccessPass, UserProfile } from '../services/graphService';

const TemporaryAccessPassPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tapResult, setTapResult] = useState<TemporaryAccessPass | null>(null);
  const [lifetimeMinutes, setLifetimeMinutes] = useState('60');
  const [isUsableOnce, setIsUsableOnce] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTapResult(null);
      
      const results = await graphService.searchUsers(searchTerm);
      setSearchResults(results);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to search users. Please ensure you are signed in.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTAP = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);
      
      const tap = await graphService.createTemporaryAccessPass(
        selectedUser.id,
        parseInt(lifetimeMinutes),
        isUsableOnce
      );
      
      setTapResult(tap);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate Temporary Access Pass. Please check your permissions.';
      setError(errorMessage);
      console.error('TAP Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTAP = () => {
    if (tapResult?.temporaryAccessPass) {
      navigator.clipboard.writeText(tapResult.temporaryAccessPass);
      alert('Temporary Access Pass copied to clipboard!');
    }
  };

  const handleGenerateTAPViaLogicApp = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://prod-04.northcentralus.logic.azure.com:443/workflows/d02ff0de666a48bc82a2e0e83d5cb704/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=kcCFwezAJbXTzMKFtEg5PwLu5w2YTOD1quvdJXR1avk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entraObjectId: selectedUser.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorDetails = errorText || response.statusText;
        
        // Parse error JSON if available
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorDetails = `${errorJson.error.code}: ${errorJson.error.message}`;
          }
        } catch {
          // Keep original error text if not JSON
        }
        
        // Provide helpful message for common errors
        if (response.status === 502) {
          throw new Error(`Logic App timeout (502): The Logic App didn't receive a response from Microsoft Graph API. This usually means:\n- The Graph API call is taking too long\n- The Logic App's managed identity may not have the required permissions\n- Check the Logic App run history in Azure Portal for details\n\nError: ${errorDetails}`);
        }
        
        throw new Error(`Logic App request failed (${response.status}): ${errorDetails}`);
      }

      // Get response text first to handle empty responses
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Logic App returned an empty response. Check if the Logic App is configured to return a response.');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Failed to parse response:', responseText);
        throw new Error(`Invalid JSON response from Logic App: ${responseText.substring(0, 100)}`);
      }
      
      // Check various possible response formats
      if (result.temporaryAccessPass) {
        setTapResult({
          temporaryAccessPass: result.temporaryAccessPass,
          lifetimeInMinutes: result.lifetimeInMinutes || parseInt(lifetimeMinutes),
          isUsableOnce: result.isUsableOnce !== undefined ? result.isUsableOnce : isUsableOnce
        });
      } else if (result.tap) {
        setTapResult({
          temporaryAccessPass: result.tap,
          lifetimeInMinutes: result.lifetimeInMinutes || parseInt(lifetimeMinutes),
          isUsableOnce: result.isUsableOnce !== undefined ? result.isUsableOnce : isUsableOnce
        });
      } else {
        console.error('Unexpected response format:', result);
        throw new Error(`TAP generation completed but response format was unexpected. Response: ${JSON.stringify(result)}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate TAP via Logic App.';
      setError(errorMessage);
      console.error('Logic App TAP Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Temporary Access Pass</h1>
        <p className="mt-2 text-gray-600">
          Generate a temporary access password for users to reset their credentials
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {tapResult && (
        <div className="mb-6">
          <Alert
            type="success"
            title="Temporary Access Pass Generated!"
            message="The TAP has been created successfully. Copy it now as it won't be shown again."
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Search for User</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter name or email..."
                  disabled={loading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900"
                />
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'white' }}
                >
                  {loading ? <LoadingSpinner size="sm" /> : <span style={{ color: 'white' }}>Search Users</span>}
                </button>
              </form>
            </CardContent>
          </Card>

          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setTapResult(null);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{user.displayName}</p>
                      <p className="text-sm text-gray-600">{user.userPrincipalName}</p>
                      {user.jobTitle && (
                        <p className="text-xs text-gray-500 mt-1">{user.jobTitle}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {selectedUser && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Generate TAP</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Selected User:</p>
                    <p className="font-medium text-gray-900">{selectedUser.displayName}</p>
                    <p className="text-sm text-gray-600">{selectedUser.userPrincipalName}</p>
                  </div>

                  <div>
                    <label htmlFor="lifetime-minutes" className="block text-sm font-medium text-gray-700 mb-1">
                      Lifetime (minutes)
                    </label>
                    <input
                      id="lifetime-minutes"
                      type="number"
                      min="10"
                      max="480"
                      value={lifetimeMinutes}
                      onChange={(e) => setLifetimeMinutes(e.target.value)}
                      disabled={loading || !!tapResult}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500">Between 10 and 480 minutes</p>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="usable-once"
                      type="checkbox"
                      checked={isUsableOnce}
                      onChange={(e) => setIsUsableOnce(e.target.checked)}
                      disabled={loading || !!tapResult}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="usable-once" className="ml-2 block text-sm text-gray-700">
                      Single use only
                    </label>
                  </div>

                  {tapResult ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800 mb-2">
                              Temporary Access Pass:
                            </p>
                            <code className="block bg-white px-3 py-2 rounded border border-green-300 text-lg font-mono text-gray-900 break-all">
                              {tapResult.temporaryAccessPass}
                            </code>
                            <div className="mt-3 flex items-center text-sm text-green-700">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Valid for {tapResult.lifetimeInMinutes} minutes
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button 
                          onClick={handleCopyTAP} 
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md shadow-sm bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          style={{ color: 'white' }}
                        >
                          <span style={{ color: 'white' }}>Copy TAP</span>
                        </button>
                        <button
                          onClick={() => {
                            setTapResult(null);
                            setSelectedUser(null);
                            setSearchResults([]);
                            setSearchTerm('');
                          }}
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border-2 border-gray-400 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          style={{ color: '#374151' }}
                        >
                          <span style={{ color: '#374151' }}>Generate Another</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleGenerateTAP}
                        disabled={loading}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: 'white' }}
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2" style={{ color: 'white' }}>Generating...</span>
                          </>
                        ) : (
                          <>
                            <KeyIcon className="h-5 w-5 mr-2" style={{ color: 'white' }} />
                            <span style={{ color: 'white' }}>Generate Temporary Access Pass</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleGenerateTAPViaLogicApp}
                        disabled={loading}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: 'white' }}
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2" style={{ color: 'white' }}>Generating...</span>
                          </>
                        ) : (
                          <>
                            <KeyIcon className="h-5 w-5 mr-2" style={{ color: 'white' }} />
                            <span style={{ color: 'white' }}>Issue TAP via LogicApp</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemporaryAccessPassPage;
