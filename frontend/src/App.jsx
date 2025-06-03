import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CodeEditor from './pages/CodeEditor';
import Profile from './pages/Profile';
import JoinTeam from './pages/JoinTeam';

// Contexts
import { UserPreferencesProvider, useUserPreferences } from './contexts/UserPreferencesContext';

// Styles
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { preferences } = useUserPreferences();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${
        preferences.theme === 'light' ? 'bg-gray-100' : 'bg-primary'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      preferences.theme === 'light' 
        ? 'bg-gray-100 text-gray-900' 
        : 'bg-primary text-white'
    }`}>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <Auth />} 
        />
        <Route 
          path="/auth" 
          element={<Auth />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/editor/:roomId" 
          element={user ? <CodeEditor /> : <Navigate to="/" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/" />} 
        />
        <Route 
          path="/join-team" 
          element={<JoinTeam />} 
        />
      </Routes>
      <ToastContainer 
        position="bottom-right"
        theme={preferences.theme === 'light' ? 'light' : 'dark'}
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
