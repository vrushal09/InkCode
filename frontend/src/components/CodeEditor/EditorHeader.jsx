import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { SparklesIcon } from '@heroicons/react/24/outline';

const EditorHeader = ({
    collaborators,
    codeBlame,
    unreadCount,
    toggleChat,
    toggleAIAssistant,
    navigate
}) => {
    const { preferences } = useUserPreferences();
    return (        <div className="bg-[#0A0A0A] border-b border-[#242424] sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Project Info */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                                <span className="text-black font-bold text-sm">IC</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Code Editor</h1>
                                <p className="text-xs text-white/60">Team Collaboration</p>
                            </div>
                        </div>
                    </div>

                    {/* Collaborators */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {collaborators.map((user) => (
                                <div
                                    key={user.id}
                                    className="relative group"
                                    title={`${user.name}\nLast active: ${new Date(user.lastActive).toLocaleString()}`}
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#242424] group-hover:border-white/20 transition-colors">
                                        <img
                                            src={user.photoURL}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {user.isCreator && (
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 border-2 border-[#0A0A0A] rounded-full"></div>
                                    )}
                                </div>
                            ))}
                        </div>                        {/* Last Editor Info */}
                        {codeBlame.lastEditor && (
                            <div className="hidden md:flex items-center text-sm text-white/60">
                                <span>Last edited by: </span>
                                <div className="flex items-center gap-2 ml-2">
                                    <img
                                        src={codeBlame.lastEditor.userPhoto}
                                        alt={codeBlame.lastEditor.userName}
                                        className="w-5 h-5 rounded-full"
                                    />
                                    <span>{codeBlame.lastEditor.userName}</span>
                                </div>
                            </div>
                        )}
                    </div>                    {/* Controls */}
                    <div className="flex items-center space-x-3">                        {/* Auto-save indicator */}
                        {preferences.autoSave && (
                            <div className="flex items-center gap-2 p-[10px] bg-green-900/30 border border-green-700/50 rounded-xl">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-300 font-medium">Auto-save: ON</span>
                            </div>
                        )}
                        
                        {/* AI Assistant Button */}
                        <button
                            onClick={toggleAIAssistant}
                            className="p-3 bg-[#242424] border border-[#242424] rounded-xl hover:bg-white/20 transition-colors group"
                            title="AI Assistant"
                        >
                            <SparklesIcon className="h-5 w-5 text-white group-hover:text-white" />
                        </button>
                        
                        {/* Chat Toggle Button */}
                        <button
                            onClick={toggleChat}
                            className={`relative p-3 bg-[#242424] border border-[#242424] rounded-xl hover:bg-white/20 transition-colors ${unreadCount > 0 ? 'chat-notification' : ''}`}
                            title="Toggle Chat"
                        >
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center space-x-2 px-4 py-3 bg-white text-black border border-white rounded-xl hover:bg-white/90 hover:text-black transition-colors text-sm font-medium"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorHeader;
