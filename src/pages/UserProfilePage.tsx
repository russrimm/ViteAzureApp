import { UserCircleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import Alert from '../components/Alert';
import { Card, CardContent, CardHeader } from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { graphService, UpdateUserProfileData, UserProfile } from '../services/graphService';

const UserProfilePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<UpdateUserProfileData>({
    displayName: '',
    jobTitle: '',
    department: '',
    mobilePhone: '',
    officeLocation: '',
  });

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        displayName: selectedUser.displayName || '',
        jobTitle: selectedUser.jobTitle || '',
        department: selectedUser.department || '',
        mobilePhone: selectedUser.mobilePhone || '',
        officeLocation: selectedUser.officeLocation || '',
      });
    }
  }, [selectedUser]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const results = await graphService.searchUsers(searchTerm);
      setSearchResults(results);
      setSelectedUser(null);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to search users. Please ensure you are signed in.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await graphService.getCurrentUserProfile();
      setSelectedUser(user);
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      setError('Failed to load your profile. Please ensure you are signed in.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await graphService.updateUserProfile(selectedUser.id, formData);
      
      setSuccess(true);
      setIsEditing(false);
      
      // Reload user profile
      const updatedUser = await graphService.getUserProfile(selectedUser.id);
      setSelectedUser(updatedUser);
    } catch (err) {
      setError('Failed to update profile. Please check your permissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Profile Management</h1>
        <p className="mt-2 text-gray-600">View and update user profile information</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {success && (
        <div className="mb-6">
          <Alert
            type="success"
            title="Success!"
            message="User profile has been updated successfully."
            onClose={() => setSuccess(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Find User</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter name or email..."
                  disabled={loading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
                <div className="flex space-x-3">
                  <button type="submit" disabled={loading} className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <LoadingSpinner size="sm" /> : <span className="text-white">Search Users</span>}
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadCurrentUser}
                    disabled={loading}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    <span className="text-gray-700">My Profile</span>
                  </button>
                </div>
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
                        setIsEditing(false);
                        setSuccess(false);
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
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">User Profile</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span className="text-gray-700">Edit Profile</span>
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        disabled={loading}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        disabled={loading}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        disabled={loading}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="mobilePhone" className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
                      <input
                        id="mobilePhone"
                        name="mobilePhone"
                        type="tel"
                        value={formData.mobilePhone}
                        onChange={handleChange}
                        disabled={loading}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="officeLocation" className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                      <input
                        id="officeLocation"
                        name="officeLocation"
                        value={formData.officeLocation}
                        onChange={handleChange}
                        disabled={loading}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          if (selectedUser) {
                            setFormData({
                              displayName: selectedUser.displayName || '',
                              jobTitle: selectedUser.jobTitle || '',
                              department: selectedUser.department || '',
                              mobilePhone: selectedUser.mobilePhone || '',
                              officeLocation: selectedUser.officeLocation || '',
                            });
                          }
                        }}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-gray-700">Cancel</span>
                      </button>
                      <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2 text-white">Saving...</span>
                          </>
                        ) : (
                          <span className="text-white">Save Changes</span>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Display Name</p>
                      <p className="mt-1 text-gray-900">{selectedUser.displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-gray-900">
                        {selectedUser.mail || selectedUser.userPrincipalName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Job Title</p>
                      <p className="mt-1 text-gray-900">{selectedUser.jobTitle || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Department</p>
                      <p className="mt-1 text-gray-900">{selectedUser.department || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mobile Phone</p>
                      <p className="mt-1 text-gray-900">{selectedUser.mobilePhone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Office Location</p>
                      <p className="mt-1 text-gray-900">
                        {selectedUser.officeLocation || 'Not set'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
