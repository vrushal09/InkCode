import { useRef, useEffect } from 'react';
import { auth } from '../../config/firebase';

const ChatPanel = ({
    isOpen,
    messages,
    collaborators,
    newMessage,
    setNewMessage,
    toggleChat,
    sendMessage,
    deleteMessage,
    formatChatTime
}) => {
    const chatInputRef = useRef(null);
    const chatMessagesRef = useRef(null);

    // Auto-scroll chat to bottom when new messages arrive
    useEffect(() => {
        if (chatMessagesRef.current && isOpen) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && chatInputRef.current) {
            setTimeout(() => {
                chatInputRef.current.focus();
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed top-20 right-6 w-80 h-96 bg-[#111119] border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col chat-slide-in">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-semibold">Team Chat</h3>
                    <span className="text-xs text-gray-400">({collaborators.length} online)</span>
                </div>
                <button
                    onClick={toggleChat}
                    className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Chat Messages */}
            <div
                ref={chatMessagesRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                        <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">Start a conversation with your team!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.userId === auth.currentUser.uid ? 'flex-row-reverse' : ''}`}
                        >
                            <img
                                src={message.userPhoto}
                                alt={message.userName}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                            <div className={`flex-1 ${message.userId === auth.currentUser.uid ? 'text-right' : ''}`}>
                                <div className={`max-w-xs p-3 rounded-lg ${message.userId === auth.currentUser.uid
                                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white ml-auto'
                                        : 'bg-[#1a1a23] text-white'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                                        <span className="font-medium">{message.userName}</span>
                                        <span>{formatChatTime(message.timestamp)}</span>
                                        {message.userId === auth.currentUser.uid && (
                                            <button
                                                onClick={() => deleteMessage(message.id)}
                                                className="ml-auto text-xs hover:text-red-300 transition-colors"
                                                title="Delete message"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm break-words">{message.text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        ref={chatInputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 p-2 bg-[#1a1a23] border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
