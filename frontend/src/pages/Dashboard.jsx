import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../config/firebase';
import { ref, push, set, onValue, query, orderByChild, limitToLast, get, remove } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

const PROGRAMMING_LANGUAGES = [
  'javascript',
  'python',
  'java',
  'cpp',
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    language: 'javascript'
  });
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const userProjectsRef = query(
      ref(database, `users/${auth.currentUser.uid}/projects`),
      orderByChild('timestamp'),
      limitToLast(50)
    );

    const unsubscribe = onValue(userProjectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).reverse();
        setProjects(projectsList);
        setFilteredProjects(projectsList);
      } else {
        setProjects([]);
        setFilteredProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter and search projects
  useEffect(() => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.language.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(project => project.language === selectedLanguage);
    }

    // Sort projects
    if (sortBy === 'recent') {
      filtered = filtered.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'language') {
      filtered = filtered.sort((a, b) => a.language.localeCompare(b.language));
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, selectedLanguage, sortBy]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const roomId = uuidv4();
      
      // Create room in rooms collection
      const roomRef = ref(database, `rooms/${roomId}`);
      await set(roomRef, {
        name: newProject.name,
        language: newProject.language,
        createdAt: Date.now(),
        createdBy: auth.currentUser.uid,
        code: getStarterCode(newProject.language)
      });

      // Add project reference to user's projects
      const projectRef = ref(database, `users/${auth.currentUser.uid}/projects`);
      const newProjectRef = push(projectRef);
      await set(newProjectRef, {
        name: newProject.name,
        language: newProject.language,
        roomId,
        timestamp: Date.now()
      });

      setIsModalOpen(false);
      setNewProject({ name: '', language: 'javascript' });
      navigate(`/editor/${roomId}`);
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const getStarterCode = (language) => {
    const starterCodes = {
      javascript: '// Welcome to your new JavaScript project\nconsole.log("Hello, World!");',
      python: '# Welcome to your new Python project\nprint("Hello, World!")',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    };
    return starterCodes[language] || '// Start coding here\n';
  };

  const joinRoom = (roomId) => {
    navigate(`/editor/${roomId}`);
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomIdToJoin.trim()) {
      toast.error('Please enter a Room ID');
      return;
    }

    try {
      const roomRef = ref(database, `rooms/${roomIdToJoin}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        toast.error('Room not found');
        return;
      }

      setIsJoinModalOpen(false);
      setRoomIdToJoin('');
      navigate(`/editor/${roomIdToJoin}`);
    } catch (error) {
      toast.error('Failed to join room');
    }
  };

  const handleDeleteProject = async (e, projectId, roomId) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      // Remove project from user's projects
      const projectRef = ref(database, `users/${auth.currentUser.uid}/projects/${projectId}`);
      await remove(projectRef);

      // Optionally remove the room if the current user is the creator
      const roomRef = ref(database, `rooms/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (roomSnapshot.exists() && roomSnapshot.val().createdBy === auth.currentUser.uid) {
        await remove(roomRef);
      }

      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: '🟨',
      python: '🐍',
      java: '☕',
      cpp: '⚡',
    };
    return icons[language] || '📄';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      {/* Header */}
      <div className="bg-[#111119] border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Welcome */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IC</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">InkCode</h1>
                  <p className="text-xs text-gray-400">Welcome back, {auth.currentUser.displayName || 'Developer'}!</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 bg-[#1a1a23] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a23] rounded-lg transition-colors"
                title="Profile"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="px-4 py-2 bg-[#1a1a23] text-gray-300 border border-gray-700 rounded-lg hover:bg-[#2a2a35] hover:text-white transition-colors text-sm font-medium"
              >
                Join Room
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors text-sm font-medium"
              >
                New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111119] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-violet-600/20 rounded-lg">
                <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111119] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Languages Used</p>
                <p className="text-2xl font-bold">{new Set(projects.map(p => p.language)).size}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111119] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Recent Activity</p>
                <p className="text-2xl font-bold">{projects.filter(p => Date.now() - p.timestamp < 7 * 24 * 60 * 60 * 1000).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 bg-[#111119] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              <option value="all">All Languages</option>
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#111119] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name A-Z</option>
              <option value="language">Language</option>
            </select>
          </div>

          <div className="text-sm text-gray-400">
            {filteredProjects.length} of {projects.length} projects
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-[#111119] rounded-full flex items-center justify-center">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Create your first project to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium"
              >
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => joinRoom(project.roomId)}
                className="group bg-[#111119] border border-gray-800 rounded-lg p-6 hover:border-violet-600/50 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-violet-600/10"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="text-2xl">{getLanguageIcon(project.language)}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold truncate group-hover:text-violet-400 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-400 capitalize">{project.language}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id, project.roomId)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Project"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1" />

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-800">
                    <span>{formatDate(project.timestamp)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(project.roomId);
                        toast.success('Room ID copied!');
                      }}
                      className="flex items-center space-x-1 text-gray-400 hover:text-violet-400 transition-colors"
                      title="Copy Room ID"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy ID</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111119] border border-gray-800 p-6 rounded-xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Programming Language
                  </label>
                  <select
                    className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    value={newProject.language}
                    onChange={(e) => setNewProject({ ...newProject, language: e.target.value })}
                  >
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {getLanguageIcon(lang)} {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-[#1a1a23] text-gray-300 border border-gray-700 rounded-lg hover:bg-[#2a2a35] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Room Modal */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111119] border border-gray-800 p-6 rounded-xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">Join Existing Room</h2>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2.5 bg-[#1a1a23] text-white placeholder-gray-500 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    placeholder="Enter Room ID"
                    value={roomIdToJoin}
                    onChange={(e) => setRoomIdToJoin(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-[#1a1a23] text-gray-300 border border-gray-700 rounded-lg hover:bg-[#2a2a35] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium"
                  >
                    Join Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;