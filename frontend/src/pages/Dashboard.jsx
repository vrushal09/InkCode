import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../config/firebase';
import { ref, push, set, onValue, query, orderByChild, limitToLast, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

const PROGRAMMING_LANGUAGES = [
  'javascript',
  'python',
  'java',
  'cpp'
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    language: 'javascript'
  });
  const [roomIdToJoin, setRoomIdToJoin] = useState('');

  useEffect(() => {
    const userProjectsRef = query(
      ref(database, `users/${auth.currentUser.uid}/projects`),
      orderByChild('timestamp'),
      limitToLast(10)
    );

    const unsubscribe = onValue(userProjectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).reverse();
        setProjects(projectsList);
      }
    });

    return () => unsubscribe();
  }, []);

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
        code: '// Start coding here\n'
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
    } catch (error) {
      toast.error('Failed to create project');
    }
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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {auth.currentUser.displayName || 'Coder'}!
            </h1>
            <p className="text-gray-400">Manage your coding projects</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-secondary"
            >
              Profile
            </button>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="btn btn-secondary"
            >
              Join Room
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              New Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => joinRoom(project.roomId)}
              className="card hover:bg-secondary/80 cursor-pointer transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span className="capitalize">{project.language}</span>
                <div className="flex items-center gap-2">
                  <span>Room: {project.roomId}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(project.roomId);
                      toast.success('Room ID copied to clipboard');
                    }}
                    className="p-1 hover:bg-primary rounded"
                    title="Copy Room ID"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-primary p-6 rounded-xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Programming Language
                  </label>
                  <select
                    className="input w-full"
                    value={newProject.language}
                    onChange={(e) => setNewProject({ ...newProject, language: e.target.value })}
                  >
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Room Modal */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-primary p-6 rounded-xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">Join Existing Room</h2>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={roomIdToJoin}
                    onChange={(e) => setRoomIdToJoin(e.target.value)}
                    placeholder="Enter Room ID"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Join
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