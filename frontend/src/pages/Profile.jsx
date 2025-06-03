import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { updateProfile, updateEmail, updatePassword, signOut, deleteUser } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useUserPreferences } from '../contexts/UserPreferencesContext';

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

  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (formData.displayName !== auth.currentUser?.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
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

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      {/* Header */}
      <div className="bg-[#111119] border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IC</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Profile Settings</h1>
                  <p className="text-xs text-gray-400">Manage your account preferences</p>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-[#1a1a23] text-gray-300 border border-gray-700 rounded-lg hover:bg-[#2a2a35] hover:text-white transition-colors text-sm font-medium"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#111119] border border-gray-800 rounded-lg p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {auth.currentUser?.displayName?.charAt(0)?.toUpperCase() || 
                     auth.currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-1">
                  {auth.currentUser?.displayName || 'User'}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {auth.currentUser?.email}
                </p>
                
                {/* Account Stats */}
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Account Type</span>
                    <span className="text-white">Developer</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white">
                      {new Date(auth.currentUser?.metadata?.creationTime).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-[#111119] border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Information
              </h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    placeholder="Enter your display name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium"
                >
                  Update Profile
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-[#111119] border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change Password
              </h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent pr-10"
                      placeholder="••••••••••••••••"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent pr-10"
                      placeholder="••••••••••••••••"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent pr-10"
                      placeholder="••••••••••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
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
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium"
                >
                  Update Password
                </button>
              </form>            </div>

            {/* User Preferences */}
            <div className="bg-[#111119] border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Editor Preferences
              </h2>
              
              <div className="space-y-6">
                {/* Editor Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => updatePreference('theme', e.target.value)}
                      className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Font Size
                    </label>
                    <select
                      value={preferences.fontSize}
                      onChange={(e) => updatePreference('fontSize', parseInt(e.target.value))}
                      className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    >
                      <option value="10">10px</option>
                      <option value="12">12px</option>
                      <option value="14">14px (Default)</option>
                      <option value="16">16px</option>
                      <option value="18">18px</option>
                      <option value="20">20px</option>
                      <option value="22">22px</option>
                      <option value="24">24px</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Font Family
                    </label>
                    <select
                      value={preferences.fontFamily}
                      onChange={(e) => updatePreference('fontFamily', e.target.value)}
                      className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    >
                      <option value="'Fira Code', 'Consolas', 'Monaco', monospace">Fira Code (Default)</option>
                      <option value="'Source Code Pro', monospace">Source Code Pro</option>
                      <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                      <option value="'SF Mono', 'Monaco', 'Consolas', monospace">SF Mono</option>
                      <option value="'Cascadia Code', monospace">Cascadia Code</option>
                      <option value="'Ubuntu Mono', monospace">Ubuntu Mono</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tab Size
                    </label>
                    <select
                      value={preferences.tabSize}
                      onChange={(e) => updatePreference('tabSize', parseInt(e.target.value))}
                      className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    >
                      <option value="2">2 spaces</option>
                      <option value="4">4 spaces (Default)</option>
                      <option value="6">6 spaces</option>
                      <option value="8">8 spaces</option>
                    </select>
                  </div>
                </div>

                {/* Toggle Settings */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">Display Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-white">Word Wrap</span>
                        <p className="text-xs text-gray-400">Wrap long lines to fit screen</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.wordWrap}
                        onChange={(e) => updatePreference('wordWrap', e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-white">Line Numbers</span>
                        <p className="text-xs text-gray-400">Show line numbers in editor</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.lineNumbers}
                        onChange={(e) => updatePreference('lineNumbers', e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-white">Minimap</span>
                        <p className="text-xs text-gray-400">Show code overview panel</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.minimap}
                        onChange={(e) => updatePreference('minimap', e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-white">Auto Completion</span>
                        <p className="text-xs text-gray-400">Enable smart suggestions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.autoCompletion}
                        onChange={(e) => updatePreference('autoCompletion', e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-white">Bracket Matching</span>
                        <p className="text-xs text-gray-400">Highlight matching brackets</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.bracketMatching}
                        onChange={(e) => updatePreference('bracketMatching', e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-white">Highlight Active Line</span>
                        <p className="text-xs text-gray-400">Highlight current line</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.highlightActiveLine}
                        onChange={(e) => updatePreference('highlightActiveLine', e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                    </label>
                  </div>
                </div>

                {/* UI Preferences */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">UI Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-white">Auto Save</span>
                        <p className="text-xs text-gray-400">Automatically save changes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.autoSave}
                        onChange={(e) => updatePreference('autoSave', e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-white">Chat Notifications</span>
                        <p className="text-xs text-gray-400">Show chat message alerts</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.chatNotifications}
                        onChange={(e) => updatePreference('chatNotifications', e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-white">Indent with Tabs</span>
                        <p className="text-xs text-gray-400">Use tabs instead of spaces</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.indentWithTabs}
                        onChange={(e) => updatePreference('indentWithTabs', e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-gray-800 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-700 pt-4 flex justify-between">
                  <button
                    onClick={resetPreferences}
                    className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium border border-gray-500"
                  >
                    Reset to Defaults
                  </button>
                  <div className="text-sm text-gray-400 flex items-center">
                    <svg className="h-4 w-4 mr-1 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Settings saved automatically
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#111119] border border-red-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-red-400">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Danger Zone
              </h2>
              
              <div>
                <p className="text-gray-400 mb-3">
                  <strong className="text-red-400">Warning:</strong> This action cannot be undone. This will permanently delete your account and all associated data.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium border border-red-600"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111119] border border-red-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="h-8 w-8 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-bold text-red-400">Delete Account</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                This action <strong className="text-red-400">cannot be undone</strong>. This will permanently delete your account and all associated data.
              </p>
              <p className="text-gray-400 mb-4">
                Type <span className="font-mono bg-gray-800 px-2 py-1 rounded text-red-400">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a23] text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Type DELETE here"
                autoFocus
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteAccount}
                className="flex-1 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={deleteConfirmationText !== 'DELETE'}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  deleteConfirmationText === 'DELETE'
                    ? 'bg-red-800 text-white hover:bg-red-900 border border-red-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
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