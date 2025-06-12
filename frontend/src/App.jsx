import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { getThemeInfo } from './config/themes';
import React from "react";


// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CodeEditor from './pages/CodeEditor';
import Profile from './pages/Profile';
import JoinTeam from './pages/JoinTeam';
import Instructions from './pages/Instructions';
import Home from './pages/Home';

// Contexts
import { UserPreferencesProvider, useUserPreferences } from './contexts/UserPreferencesContext';

// Styles
import 'react-toastify/dist/ReactToastify.css';
import Loader from './components/Loader';

function AppContent() {
  const { preferences } = useUserPreferences();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Get theme info to determine if it's light or dark
  const themeInfo = getThemeInfo(preferences.theme);
  const isLightTheme = themeInfo.category === 'Light';
  // Update document title based on current path
  useEffect(() => {
    const getPageTitle = () => {
      const path = location.pathname;
      
      if (path === "/home") return "Home | InkCode";
      if (path === "/auth") return "Login | InkCode";
      if (path === "/dashboard") return "Dashboard | InkCode";
      if (path.startsWith("/editor")) return "Code Editor | InkCode";
      if (path === "/profile") return "Profile | InkCode";
      if (path === "/join-team") return "Join Team | InkCode";
      if (path === "/instructions") return "Instructions | InkCode";
      
      return "InkCode";
    };
    
    document.title = getPageTitle();
  }, [location]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLightTheme
      ? 'bg-gray-100 text-gray-900'
      : 'bg-primary text-white'
      }`}>      <Routes>
        <Route
          path="/"
          element={<Navigate to="/home" />}
        />
        <Route
          path="/home"
          element={user ? <Home/> : <Navigate to="/auth" />}
        />
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" /> : <Auth />}
        />        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/auth" />}
        />
        <Route
          path="/editor/:roomId"
          element={user ? <CodeEditor /> : <Navigate to="/auth" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/auth" />}
        />        <Route
          path="/join-team"
          element={<JoinTeam />}
        />        <Route
          path="/instructions"
          element={user ? <Instructions /> : <Navigate to="/auth" />}
        />
      </Routes>
      <ToastContainer
        position="bottom-right"
        theme={isLightTheme ? 'light' : 'dark'}
        autoClose={3000}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <UserPreferencesProvider>
        <AppContent />
      </UserPreferencesProvider>
    </Router>
  );
}


export default App;
