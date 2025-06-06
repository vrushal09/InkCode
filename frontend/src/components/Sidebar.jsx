import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';

const Sidebar = ({ currentPage = 'dashboard' }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'profile':
        return 'Profile';
      case 'dashboard':
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0A0A0A] border-r border-[#242424] flex flex-col transition-all duration-300`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-[#242424]">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#FFFFFF] rounded-lg flex items-center justify-center">
                <span className="text-[#000000] font-bold text-sm">IC</span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-[#FFFFFF]">InkCode</h1>
                <p className="text-xs text-[#FFFFFF]/50">{getPageTitle()}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-md transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6">
        <nav className="space-y-2 px-3">
          {/* Projects/Dashboard Navigation */}
          {currentPage === 'dashboard' ? (
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-[#FFFFFF] bg-[#242424] rounded-lg`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Projects</span>}
            </div>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-[#FFFFFF]/70 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-lg transition-colors`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm">Projects</span>}
            </button>
          )}

          {/* Profile Navigation */}
          {currentPage === 'profile' ? (
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-[#FFFFFF] bg-[#242424] rounded-lg`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Profile</span>}
            </div>
          ) : (
            <button
              onClick={() => navigate('/profile')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-[#FFFFFF]/70 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-lg transition-colors`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm">Profile</span>}
            </button>
          )}

          {/* Help Navigation */}
          <button
            onClick={() => navigate('/instructions')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-[#FFFFFF]/70 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-lg transition-colors`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!sidebarCollapsed && <span className="text-sm">Help</span>}
          </button>
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[#242424]">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#242424]">
            {auth.currentUser?.photoURL ? (
              <img
                src={auth.currentUser.photoURL}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#FFFFFF] flex items-center justify-center">
                <span className="text-[#000000] font-bold text-xs">
                  {auth.currentUser?.displayName?.charAt(0)?.toUpperCase() ||
                    auth.currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#FFFFFF] truncate">
                {auth.currentUser?.displayName || 'Developer'}
              </p>
              <p className="text-xs text-[#FFFFFF]/50 truncate">
                {auth.currentUser?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
