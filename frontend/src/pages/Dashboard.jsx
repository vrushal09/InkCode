import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../config/firebase';
import { ref, push, set, onValue, query, orderByChild, limitToLast } from 'firebase/database';
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
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    language: 'javascript'
  });

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
                <span>Room: {project.roomId.slice(0, 8)}...</span>
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
      </div>
    </div>
  );
};

export default Dashboard;