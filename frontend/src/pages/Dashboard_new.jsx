import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../config/firebase';
import { ref, push, set, onValue, query, orderByChild, limitToLast, get, remove } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import TeamManager from '../components/TeamManager';

// Removed language constants as we now auto-detect from file extensions

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Load user's own projects
        const userProjectsRef = ref(database, `users/${auth.currentUser.uid}/projects`);
        const userProjectsSnap = await get(userProjectsRef);
        const userProjectIds = userProjectsSnap.exists() ? Object.keys(userProjectsSnap.val()) : [];

        // Load projects created by user
        const createdProjectsRef = ref(database, 'projects');
        const createdProjectsUnsubscribe = onValue(createdProjectsRef, async (snapshot) => {
          const data = snapshot.val() || {};
          const allProjects = Object.entries(data).map(([id, project]) => ({
            id,
            ...project
          }));

          // Filter projects where user is creator or team member
          const userProjects = allProjects.filter(project =>
            project.createdBy === auth.currentUser.uid || userProjectIds.includes(project.id)
          );

          setProjects(userProjects);
        });

        return () => createdProjectsUnsubscribe();
      } catch (error) {
        console.error('Error loading projects:', error);
        toast.error('Failed to load projects');
      }
    };

    if (auth.currentUser) {
      loadProjects();
    }
  }, []);

  // Filter and search projects
  useEffect(() => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort projects
    if (sortBy === 'recent') {
      filtered = filtered.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, sortBy]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const projectId = uuidv4();
      const roomId = uuidv4();
      // Create project in projects collection
      const projectRef = ref(database, `projects/${projectId}`);
      await set(projectRef, {
        name: newProject.name,
        createdAt: Date.now(),
        createdBy: auth.currentUser.uid,
        roomId,
        teamMembers: {
          [auth.currentUser.uid]: {
            userId: auth.currentUser.uid,
            name: auth.currentUser.displayName || 'Unknown',
            email: auth.currentUser.email,
            photoURL: auth.currentUser.photoURL || `https://api.dicebear.com/7.x/avatars/svg?seed=${auth.currentUser.uid}`,
            role: 'owner',
            joinedAt: Date.now()
          }
        }
      });

      // Create room in rooms collection with empty files structure
      const roomRef = ref(database, `rooms/${roomId}`);
      await set(roomRef, {
        name: newProject.name,
        createdAt: Date.now(),
        createdBy: auth.currentUser.uid,
        projectId,
        files: {} // Initialize empty files structure for file system
      });

      // Add project to user's projects list
      const userProjectRef = ref(database, `users/${auth.currentUser.uid}/projects/${projectId}`);
      await set(userProjectRef, {
        projectId,
        joinedAt: Date.now(),
        role: 'owner'
      });

      setIsModalOpen(false);
      setNewProject({ name: '' });
      navigate(`/editor/${roomId}`);
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const joinRoom = (roomId) => {
    navigate(`/editor/${roomId}`);
  };

  const openTeamManager = (e, projectId) => {
    e.stopPropagation();
    setSelectedProjectId(projectId);
    setIsTeamModalOpen(true);
  };

  const handleDeleteProject = async (e, projectId, roomId) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this project? This will remove it for all team members.')) {
      return;
    }

    try {
      // Get project data before deletion to access invitations
      const project = projects.find(p => p.id === projectId);

      // Remove project from projects collection (this also removes project invitations)
      const projectRef = ref(database, `projects/${projectId}`);
      await remove(projectRef);

      // Remove the associated room
      const roomRef = ref(database, `rooms/${roomId}`);
      await remove(roomRef);

      // Remove project from all team members' user projects
      if (project?.teamMembers) {
        const removePromises = Object.keys(project.teamMembers).map(userId => {
          const userProjectRef = ref(database, `users/${userId}/projects/${projectId}`);
          return remove(userProjectRef);
        });
        await Promise.all(removePromises);
      }

      // Clean up any pending global invitations for this project
      if (project?.invitations) {
        const globalInviteCleanup = Object.values(project.invitations).map(invitation => {
          if (invitation.token) {
            const globalInviteRef = ref(database, `invitations/${invitation.token}`);
            return remove(globalInviteRef);
          }
        }).filter(Boolean); // Remove undefined entries

        if (globalInviteCleanup.length > 0) {
          await Promise.all(globalInviteCleanup);
        }
      }

      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#000000] flex">
      {/* Sidebar */}
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
                  <p className="text-xs text-[#FFFFFF]/50">Dashboard</p>
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
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-[#FFFFFF] bg-[#242424] rounded-lg`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Projects</span>}
            </div>

            <button
              onClick={() => navigate('/profile')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-[#FFFFFF]/70 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-lg transition-colors`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm">Profile</span>}
            </button>

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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-[#000000] border-b border-[#242424] p-4">
          <div className="flex items-center justify-between">
            {/* Left: Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-[#FFFFFF]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FFFFFF] placeholder-[#FFFFFF]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30 text-sm"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3 ml-6">
              {/* View Toggle */}
              <div className="flex bg-[#0A0A0A] border border-[#242424] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#242424] text-[#FFFFFF]' : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF]'}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#242424] text-[#FFFFFF]' : 'text-[#FFFFFF]/60 hover:text-[#FFFFFF]'}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded-lg text-[#FFFFFF] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name A-Z</option>
              </select>

              {/* New Project */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-[#FFFFFF] text-[#000000] rounded-lg hover:bg-[#FFFFFF]/90 transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Project</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#000000]">
          <div className="p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#FFFFFF]/60 uppercase tracking-wide">Total Projects</p>
                    <p className="text-xl font-bold text-[#FFFFFF] mt-1">{projects.length}</p>
                  </div>
                  <div className="p-2 bg-[#242424] rounded-lg">
                    <svg className="h-4 w-4 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#FFFFFF]/60 uppercase tracking-wide">This Week</p>
                    <p className="text-xl font-bold text-[#FFFFFF] mt-1">
                      {projects.filter(p => Date.now() - p.createdAt < 7 * 24 * 60 * 60 * 1000).length}
                    </p>
                  </div>
                  <div className="p-2 bg-[#242424] rounded-lg">
                    <svg className="h-4 w-4 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#FFFFFF]/60 uppercase tracking-wide">Team Projects</p>
                    <p className="text-xl font-bold text-[#FFFFFF] mt-1">
                      {projects.filter(p => p.createdBy !== auth.currentUser.uid).length}
                    </p>
                  </div>
                  <div className="p-2 bg-[#242424] rounded-lg">
                    <svg className="h-4 w-4 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#FFFFFF]/60 uppercase tracking-wide">My Projects</p>
                    <p className="text-xl font-bold text-[#FFFFFF] mt-1">
                      {projects.filter(p => p.createdBy === auth.currentUser.uid).length}
                    </p>
                  </div>
                  <div className="p-2 bg-[#242424] rounded-lg">
                    <svg className="h-4 w-4 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#FFFFFF]">Projects</h2>
              <span className="text-sm text-[#FFFFFF]/60">
                {filteredProjects.length} of {projects.length} projects
              </span>
            </div>

            {/* Projects Content */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#0A0A0A] border border-[#242424] rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-[#FFFFFF]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#FFFFFF] mb-2">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-[#FFFFFF]/60 mb-6 text-sm">
                  {searchQuery ? 'Try adjusting your search terms' : 'Create your first project to get started'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-[#FFFFFF] text-[#000000] rounded-lg hover:bg-[#FFFFFF]/90 transition-colors font-medium"
                  >
                    Create Your First Project
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                {filteredProjects.map((project) => (
                  viewMode === 'grid' ? (
                    // Grid View
                    <div
                      key={project.id}
                      className="group bg-[#0A0A0A] border border-[#242424] rounded-xl p-5 hover:border-[#FFFFFF]/20 transition-all duration-200 cursor-pointer"
                      onClick={() => joinRoom(project.roomId)}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-[#242424] rounded-lg flex items-center justify-center group-hover:bg-[#FFFFFF]/10 transition-colors">
                              <span className="text-[#FFFFFF] text-sm font-medium">
                                {project.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-medium truncate text-[#FFFFFF] group-hover:text-[#FFFFFF]/90 transition-colors">
                                {project.name}
                              </h3>
                              <p className="text-xs text-[#FFFFFF]/60">
                                {formatDate(project.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => openTeamManager(e, project.id)}
                              className="p-1.5 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-md transition-colors"
                              title="Manage Team"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </button>
                            {project.createdBy === auth.currentUser.uid && (
                              <button
                                onClick={(e) => handleDeleteProject(e, project.id, project.roomId)}
                                className="p-1.5 text-[#FFFFFF]/60 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                title="Delete Project"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Team Members */}
                        {project.teamMembers && Object.keys(project.teamMembers).length > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex -space-x-1">
                              {Object.values(project.teamMembers).slice(0, 3).map((member) => (
                                <img
                                  key={member.userId}
                                  src={member.photoURL}
                                  alt={member.name}
                                  className="w-5 h-5 rounded-full border border-[#0A0A0A]"
                                  title={member.name}
                                />
                              ))}
                              {Object.keys(project.teamMembers).length > 3 && (
                                <div className="w-5 h-5 rounded-full bg-[#242424] border border-[#0A0A0A] flex items-center justify-center">
                                  <span className="text-xs text-[#FFFFFF]/80">+{Object.keys(project.teamMembers).length - 3}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-[#FFFFFF]/50">
                              {Object.keys(project.teamMembers).length} member{Object.keys(project.teamMembers).length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}

                        <div className="flex-1" />

                        <div className="flex items-center justify-between text-xs text-[#FFFFFF]/50 pt-4 border-t border-[#242424]">
                          <span className={project.createdBy === auth.currentUser.uid ? 'text-[#FFFFFF]/70' : 'text-[#FFFFFF]/50'}>
                            {project.createdBy === auth.currentUser.uid ? 'Owner' : 'Member'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(project.roomId);
                              toast.success('Room ID copied!');
                            }}
                            className="flex items-center space-x-1 text-[#FFFFFF]/50 hover:text-[#FFFFFF]/80 transition-colors"
                            title="Copy Room ID"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List View
                    <div
                      key={project.id}
                      className="group bg-[#0A0A0A] border border-[#242424] rounded-lg p-4 hover:border-[#FFFFFF]/20 transition-all duration-200 cursor-pointer"
                      onClick={() => joinRoom(project.roomId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-[#242424] rounded-lg flex items-center justify-center group-hover:bg-[#FFFFFF]/10 transition-colors">
                            <span className="text-[#FFFFFF] text-sm font-medium">
                              {project.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium truncate text-[#FFFFFF] group-hover:text-[#FFFFFF]/90 transition-colors">
                              {project.name}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-[#FFFFFF]/60">
                                {formatDate(project.createdAt)}
                              </p>
                              {project.teamMembers && (
                                <p className="text-xs text-[#FFFFFF]/50">
                                  {Object.keys(project.teamMembers).length} member{Object.keys(project.teamMembers).length !== 1 ? 's' : ''}
                                </p>
                              )}
                              <span className="text-xs text-[#FFFFFF]/50">
                                {project.createdBy === auth.currentUser.uid ? 'Owner' : 'Member'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Team Members */}
                          {project.teamMembers && Object.keys(project.teamMembers).length > 0 && (
                            <div className="flex -space-x-1 mr-4">
                              {Object.values(project.teamMembers).slice(0, 3).map((member) => (
                                <img
                                  key={member.userId}
                                  src={member.photoURL}
                                  alt={member.name}
                                  className="w-6 h-6 rounded-full border border-[#0A0A0A]"
                                  title={member.name}
                                />
                              ))}
                              {Object.keys(project.teamMembers).length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-[#242424] border border-[#0A0A0A] flex items-center justify-center">
                                  <span className="text-xs text-[#FFFFFF]/80">+{Object.keys(project.teamMembers).length - 3}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => openTeamManager(e, project.id)}
                              className="p-1.5 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-md transition-colors"
                              title="Manage Team"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </button>
                            {project.createdBy === auth.currentUser.uid && (
                              <button
                                onClick={(e) => handleDeleteProject(e, project.id, project.roomId)}
                                className="p-1.5 text-[#FFFFFF]/60 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                title="Delete Project"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(project.roomId);
                                toast.success('Room ID copied!');
                              }}
                              className="p-1.5 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-md transition-colors"
                              title="Copy Room ID"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0A0A0A] border border-[#242424] p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-6 text-[#FFFFFF]">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-3 bg-[#000000] text-[#FFFFFF] placeholder-[#FFFFFF]/50 border border-[#242424] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
                <p className="text-xs text-[#FFFFFF]/60 mt-2">
                  File language will be automatically detected when you create files
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-[#242424] text-[#FFFFFF]/80 border border-[#242424] rounded-lg hover:bg-[#242424]/80 hover:text-[#FFFFFF] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#FFFFFF] text-[#000000] rounded-lg hover:bg-[#FFFFFF]/90 transition-colors font-medium"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Manager Modal */}
      <TeamManager
        projectId={selectedProjectId}
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setSelectedProjectId(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
