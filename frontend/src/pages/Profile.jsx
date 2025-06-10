import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { updateProfile, updateEmail, updatePassword, signOut, deleteUser } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { AVAILABLE_THEMES, getThemesByCategory, getThemeInfo } from '../config/themes';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const navigate = useNavigate();
  const { preferences, updatePreference, resetPreferences } = useUserPreferences();

  const [formData, setFormData] = useState({
    displayName: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [profilePhotoURL, setProfilePhotoURL] = useState(auth.currentUser?.photoURL || '');

  // Keep profile photo URL in sync with auth user
  useEffect(() => {
    if (auth.currentUser?.photoURL) {
      setProfilePhotoURL(auth.currentUser.photoURL);
    }
  }, [auth.currentUser]);
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Update profile details including display name and photo URL if changed
      if (formData.displayName !== auth.currentUser?.displayName ||
        profilePhotoURL !== auth.currentUser?.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName,
          photoURL: profilePhotoURL
        });
      }

      if (formData.email !== auth.currentUser?.email) {
        await updateEmail(auth.currentUser, formData.email);
      }

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        await updatePassword(auth.currentUser, formData.newPassword);
      }

      toast.success('Profile updated successfully!');
      // Reset password fields after successful update
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
        navigate('/');
        toast.success('Logged out successfully!');
      } catch (error) {
        toast.error('Failed to logout');
      }
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm account deletion');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        // First try to delete the account
        try {
          await deleteUser(user);
          navigate('/');
          toast.success('Account deleted successfully');
        } catch (error) {
          if (error.code === 'auth/requires-recent-login') {
            // If requires recent login, sign out first then delete
            toast.info('Re-authenticating for security...');
            await signOut(auth);
            navigate('/');
            toast.success('Account has been deleted. You have been logged out for security.');
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account: ' + error.message);
    } finally {
      setShowDeleteConfirmation(false);
      setDeleteConfirmationText('');
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmationText('');
  };
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  // Handle photo URL input change
  const handlePhotoURLChange = (e) => {
    setProfilePhotoURL(e.target.value);
  };

  // Handle file select for profile photo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhotoURL(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile photo
  const removeProfilePhoto = () => {
    setProfilePhotoURL('');
  };

  return (
    <div className="min-h-screen bg-[#000000] flex">
      {/* Sidebar */}
      <Sidebar currentPage="profile" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-[#000000] border-b border-[#242424] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#FFFFFF]">Profile Settings</h1>
              <p className="text-sm text-[#FFFFFF]/60">Manage your account and editor preferences</p>
            </div>            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-[#FFFFFF] border border-red-500 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-[#000000]">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Profile Overview Card */}
                <div className="lg:col-span-1">
                  <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">                  <div className="text-center">                    {/* Avatar - Show profile image or first letter as fallback */}
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                      {auth.currentUser?.photoURL ? (
                        <img
                          src={auth.currentUser.photoURL}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const fallbackDiv = e.target.parentNode.querySelector('.fallback-avatar');
                            if (fallbackDiv) fallbackDiv.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="fallback-avatar w-full h-full bg-[#FFFFFF] flex items-center justify-center"
                        style={{ display: auth.currentUser?.photoURL ? 'none' : 'flex' }}
                      >
                        <span className="text-[#000000] font-bold text-2xl">
                          {auth.currentUser?.displayName?.charAt(0)?.toUpperCase() ||
                            auth.currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-[#FFFFFF] mb-1">
                      {auth.currentUser?.displayName || 'User'}
                    </h3>
                    <p className="text-sm text-[#FFFFFF]/60 mb-4">
                      {auth.currentUser?.email}
                    </p>

                    {/* Account Stats */}
                    <div className="space-y-3 pt-4 border-t border-[#242424]">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#FFFFFF]/60">Account Type</span>
                        <span className="text-[#FFFFFF]">Developer</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#FFFFFF]/60">Member Since</span>
                        <span className="text-[#FFFFFF]">
                          {new Date(auth.currentUser?.metadata?.creationTime).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>                    </div>
                  </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">

                  {/* Profile Information */}
                  <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center text-[#FFFFFF]">
                      <svg className="h-5 w-5 mr-2 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Information
                    </h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      {/* Profile Photo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-[#FFFFFF]/80 mb-2">
                          Profile Photo
                        </label>                    <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#242424]">
                            {profilePhotoURL ? (
                              <img
                                src={profilePhotoURL}
                                alt="Profile Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  const fallbackDiv = e.target.parentNode.querySelector('.form-fallback-avatar');
                                  if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="form-fallback-avatar w-full h-full bg-[#FFFFFF] flex items-center justify-center"
                              style={{ display: profilePhotoURL ? 'none' : 'flex' }}
                            >
                              <span className="text-[#000000] font-bold text-xl">
                                {formData.displayName?.charAt(0)?.toUpperCase() ||
                                  formData.email?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col space-y-2">
                              <label className="relative cursor-pointer bg-[#242424] py-2 px-4 rounded-md text-center text-sm hover:bg-[#303030] transition-colors">
                                <span>Upload Image</span>
                                <input
                                  type="file"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                />
                              </label>
                              <input
                                type="text"
                                className="block w-full px-3 py-2 text-sm bg-[#000000] text-[#FFFFFF] placeholder-[#FFFFFF]/40 border border-[#242424] rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
                                placeholder="Or paste image URL"
                                value={profilePhotoURL}
                                onChange={handlePhotoURLChange}
                              />
                              {profilePhotoURL && (
                                <button
                                  type="button"
                                  onClick={removeProfilePhoto}
                                  className="text-red-500 text-xs hover:text-red-400"
                                >
                                  Remove Photo
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#FFFFFF]/80 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          className="block w-full px-3 py-2.5 bg-[#000000] text-[#FFFFFF] placeholder-[#FFFFFF]/40 border border-[#242424] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
                          placeholder="Enter your display name"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#FFFFFF]/80 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="block w-full px-3 py-2.5 bg-[#000000] text-[#FFFFFF] placeholder-[#FFFFFF]/40 border border-[#242424] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full px-4 py-2.5 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#FFFFFF]/90 transition-colors font-medium"
                      >
                        Update Profile
                      </button>
                    </form>
                  </div>

                  {/* Change Password */}
                  <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center text-[#FFFFFF]">
                      <svg className="h-5 w-5 mr-2 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Change Password
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#FFFFFF]/80 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            className="block w-full px-3 py-2.5 bg-[#000000] text-[#FFFFFF] placeholder-[#FFFFFF]/40 border border-[#242424] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30 pr-10"
                            placeholder="••••••••••••••••"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#FFFFFF]/60 hover:text-[#FFFFFF]"
                          >
                            {showCurrentPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>                <div>
                        <label className="block text-sm font-medium text-[#FFFFFF]/80 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            className="block w-full px-3 py-2.5 bg-[#000000] text-[#FFFFFF] placeholder-[#FFFFFF]/40 border border-[#242424] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30 pr-10"
                            placeholder="••••••••••••••••"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#FFFFFF]/60 hover:text-[#FFFFFF]"
                          >
                            {showNewPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>                <div>
                        <label className="block text-sm font-medium text-[#FFFFFF]/80 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="block w-full px-3 py-2.5 bg-[#000000] text-[#FFFFFF] placeholder-[#FFFFFF]/40 border border-[#242424] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30 pr-10"
                            placeholder="••••••••••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#FFFFFF]/60 hover:text-[#FFFFFF]"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full px-4 py-2.5 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#FFFFFF]/90 transition-colors font-medium"
                      >
                        Update Password
                      </button>
                    </form>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-[#0A0A0A] border border-red-600/30 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-red-400">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Danger Zone
                    </h2>

                    <div>
                      <p className="text-[#FFFFFF]/60 mb-3">
                        <strong className="text-red-400">Warning:</strong> This action cannot be undone. This will permanently delete your account and all associated data.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2.5 bg-red-600 text-[#FFFFFF] rounded-md hover:bg-red-700 transition-colors font-medium border border-red-500"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>        </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0A0A0A] border border-red-600/30 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="h-8 w-8 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-bold text-red-400">Delete Account</h3>
            </div>

            <div className="mb-6">
              <p className="text-[#FFFFFF]/80 mb-4">
                This action <strong className="text-red-400">cannot be undone</strong>. This will permanently delete your account and all associated data.
              </p>
              <p className="text-[#FFFFFF]/60 mb-4">
                Type <span className="font-mono bg-[#000000] px-2 py-1 rounded text-red-400">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-3 py-2 bg-[#000000] text-[#FFFFFF] placeholder-[#FFFFFF]/40 border border-[#242424] rounded-md focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50"
                placeholder="Type DELETE here"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteAccount}
                className="flex-1 px-4 py-2.5 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#FFFFFF]/90 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={deleteConfirmationText !== 'DELETE'}
                className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-colors ${deleteConfirmationText === 'DELETE'
                  ? 'bg-red-600 text-[#FFFFFF] hover:bg-red-700 border border-red-500'
                  : 'bg-[#242424] text-[#FFFFFF]/40 cursor-not-allowed border border-[#242424]'
                  }`}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;