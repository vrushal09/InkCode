import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, database } from "../config/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { StreamLanguage } from "@codemirror/language";
import { c, csharp, kotlin, scala } from "@codemirror/legacy-modes/mode/clike";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { toast } from "react-toastify";
import { CODE_EXECUTION_CONFIG, LANGUAGE_CONFIGS } from "../config/jdoodle";
import { hoverTooltip } from "@codemirror/view";
import { EditorView, gutter, GutterMarker } from "@codemirror/view";

const languageExtensions = {
    javascript: () => javascript(),
    python: () => python(),
    cpp: () => cpp(),
    c: () => StreamLanguage.define(c),
    typescript: () => javascript(), // TypeScript uses same highlighting as JavaScript
};

const languageIds = {
    javascript: "nodejs",
    python: "python3",
    cpp: "cpp17",
    c: "c",
    typescript: "nodejs", // TypeScript compiled to JS
};

const CodeEditor = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Add CSS for comment indicators with updated dark theme and custom scrollbar
        const style = document.createElement('style');
        style.textContent = `
            .cm-comments-gutter {
                width: 28px !important;
            }
            .cm-comments-gutter .comment-indicator {
                opacity: 0.8;
                transition: opacity 0.2s ease;
            }
            .cm-comments-gutter .comment-indicator:hover {
                opacity: 1;
            }
            .comment-gutter-empty {
                transition: all 0.2s ease;
            }
            .comment-gutter-empty:hover::after {
                content: '+';
                display: flex;
                align-items: center;
                justify-content: center;
                width: 18px;
                height: 18px;
                font-size: 16px;
                color: white;
                background-color: rgba(139, 92, 246, 0.7);
                border-radius: 50%;
                margin: 0 auto;
            }
            
            /* Custom scrollbar styles */
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #1f2937;
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #4b5563;
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #6b7280;
            }
            
            /* Firefox scrollbar */
            .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #4b5563 #1f2937;
            }

            /* Chat animation styles */
            .chat-slide-in {
                animation: slideInFromRight 0.3s ease-out;
            }
            
            .chat-slide-out {
                animation: slideOutToRight 0.3s ease-in;
            }
            
            @keyframes slideInFromRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutToRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            /* Chat notification pulse */
            .chat-notification {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(139, 92, 246, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            if (style.parentNode) {
                document.head.removeChild(style);
            }
        };
    }, []);

    const { roomId } = useParams();
    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [isExecuting, setIsExecuting] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [codeBlame, setCodeBlame] = useState({});
    const [lineBlameData, setLineBlameData] = useState({});

    // Add new state for comments
    const [comments, setComments] = useState({});
    const [activeComment, setActiveComment] = useState(null);
    const [newCommentLine, setNewCommentLine] = useState(null);
    const [newCommentText, setNewCommentText] = useState("");
    const [newReplyText, setNewReplyText] = useState("");
    const commentInputRef = useRef(null);

    // Chat states
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastReadTimestamp, setLastReadTimestamp] = useState(Date.now());
    const chatInputRef = useRef(null);
    const chatMessagesRef = useRef(null);

    // Add a function to adjust position of comment popups
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        function handleResize() {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const roomRef = ref(database, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCode(data.code || "");
                setLanguage(data.language || "javascript");
            }
        });        // Track collaborators and project info
        const roomDetailsRef = ref(database, `rooms/${roomId}`);
        const roomDetailsUnsubscribe = onValue(roomDetailsRef, async (snapshot) => {
            const data = snapshot.val() || {};
            const projectId = data.projectId;

            if (projectId) {
                // Load team members from project
                const projectRef = ref(database, `projects/${projectId}/teamMembers`);
                const teamUnsubscribe = onValue(projectRef, (teamSnapshot) => {
                    const teamData = teamSnapshot.val() || {};
                    const teamList = Object.values(teamData).map((member) => ({
                        ...member,
                        id: member.userId,
                        isCreator: member.role === 'owner',
                        lastActive: Date.now() // You can track this more precisely
                    }));
                    setCollaborators(teamList);
                });

                return () => teamUnsubscribe();
            } else {
                // Fallback to old room-based collaborators
                const collaboratorsRef = ref(database, `rooms/${roomId}/collaborators`);
                const collaboratorUnsubscribe = onValue(collaboratorsRef, (snapshot) => {
                    const collaboratorsData = snapshot.val() || {};
                    const collaboratorsList = Object.values(collaboratorsData).map((user) => ({
                        ...user,
                        isCreator: user.id === data.createdBy,
                    }));
                    setCollaborators(collaboratorsList);
                });

                return () => collaboratorUnsubscribe();
            }
        });        // Add current user to collaborators (for backward compatibility with old rooms)
        const userRef = ref(database, `rooms/${roomId}/collaborators/${auth.currentUser.uid}`);
        set(userRef, {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || "Anonymous",
            photoURL:
                auth.currentUser.photoURL ||
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            lastActive: Date.now(),
            isCreator: false,
        });

        return () => {
            unsubscribe();
            roomDetailsUnsubscribe();
            // Remove user from collaborators on leaving
            set(userRef, null);
        };
    }, [roomId]);

    // Chat functionality
    useEffect(() => {
        const chatRef = ref(database, `rooms/${roomId}/chat`);
        const chatUnsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val() || {};
            const messages = Object.entries(data)
                .map(([id, message]) => ({ id, ...message }))
                .sort((a, b) => a.timestamp - b.timestamp);

            setChatMessages(messages);

            // Count unread messages
            if (!isChatOpen) {
                const unread = messages.filter(msg =>
                    msg.timestamp > lastReadTimestamp &&
                    msg.userId !== auth.currentUser.uid
                ).length;
                setUnreadCount(unread);
            }
        });

        return () => chatUnsubscribe();
    }, [roomId, isChatOpen, lastReadTimestamp]);

    // Auto-scroll chat to bottom when new messages arrive
    useEffect(() => {
        if (chatMessagesRef.current && isChatOpen) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages, isChatOpen]);

    // Handle chat open/close
    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) {
            setUnreadCount(0);
            setLastReadTimestamp(Date.now());
            setTimeout(() => {
                if (chatInputRef.current) {
                    chatInputRef.current.focus();
                }
            }, 100);
        }
    };

    // Send chat message
    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const chatRef = ref(database, `rooms/${roomId}/chat`);
        const newMessageRef = push(chatRef);

        set(newMessageRef, {
            text: newMessage.trim(),
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "Anonymous",
            userPhoto: auth.currentUser.photoURL ||
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            timestamp: Date.now()
        });

        setNewMessage("");
    };

    // Delete chat message
    const deleteMessage = (messageId) => {
        const messageRef = ref(database, `rooms/${roomId}/chat/${messageId}`);
        remove(messageRef);
    };

    // Format timestamp for chat
    const formatChatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // Less than 1 minute
            return "just now";
        } else if (diff < 3600000) { // Less than 1 hour
            return `${Math.floor(diff / 60000)}m ago`;
        } else if (diff < 86400000) { // Less than 24 hours
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    };

    // Modify handleCodeChange to track changes by line
    const handleCodeChange = (value) => {
        setCode(value);
        const roomRef = ref(database, `rooms/${roomId}`);

        // First read the current room data
        onValue(roomRef, (snapshot) => {
            const currentData = snapshot.val() || {};
            const now = Date.now();

            // Get old code lines and new code lines
            const oldCode = currentData.code || "";
            const oldLines = oldCode.split('\n');
            const newLines = value.split('\n');

            // Create or update the lineBlame object
            const lineBlame = { ...(currentData.lineBlame || {}) };

            // Track changed lines by comparing old and new code
            for (let i = 0; i < newLines.length; i++) {
                // If line is new or changed, update blame data
                if (i >= oldLines.length || newLines[i] !== oldLines[i]) {
                    lineBlame[i] = {
                        userId: auth.currentUser.uid,
                        userName: auth.currentUser.displayName || "Anonymous",
                        userPhoto: auth.currentUser.photoURL ||
                            "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
                        timestamp: now
                    };
                }
            }

            // Keep track of last editor for the whole file
            const blameData = { ...(currentData.codeBlame || {}) };
            blameData.lastEditor = {
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || "Anonymous",
                userPhoto: auth.currentUser.photoURL ||
                    "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
                timestamp: now
            };

            // Then update data preserving other fields
            set(roomRef, {
                ...currentData,
                code: value,
                language,
                lastUpdated: now,
                codeBlame: blameData,
                lineBlame: lineBlame // Save line-by-line blame data
            });
        }, { onlyOnce: true });
    };    const executeCode = async () => {
        setIsExecuting(true);
        setOutput("");

        try {
            // Simulate code execution for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate execution delay
            
            let mockOutput = "";
            
            switch (language) {
                case 'javascript':
                case 'typescript':
                    if (code.includes('console.log')) {
                        const matches = code.match(/console\.log\(['"`]([^'"`]+)['"`]\)/g);
                        if (matches) {
                            mockOutput = matches.map(match => {
                                const content = match.match(/console\.log\(['"`]([^'"`]+)['"`]\)/);
                                return content ? content[1] : '';
                            }).join('\n');
                        } else {
                            mockOutput = "Hello, World!";
                        }
                    } else {
                        mockOutput = "Code executed successfully!\nNote: This is a demo environment.";
                    }
                    break;
                    
                case 'python':
                    if (code.includes('print')) {
                        const matches = code.match(/print\(['"`]([^'"`]+)['"`]\)/g);
                        if (matches) {
                            mockOutput = matches.map(match => {
                                const content = match.match(/print\(['"`]([^'"`]+)['"`]\)/);
                                return content ? content[1] : '';
                            }).join('\n');
                        } else {
                            mockOutput = "Hello, World!";
                        }
                    } else {
                        mockOutput = "Code executed successfully!\nNote: This is a demo environment.";
                    }
                    break;
                    
                case 'c':
                    if (code.includes('printf')) {
                        mockOutput = "Hello, World!";
                    } else {
                        mockOutput = "Code compiled and executed successfully!\nNote: This is a demo environment.";
                    }
                    break;
                    
                case 'cpp':
                    if (code.includes('cout')) {
                        mockOutput = "Hello, World!";
                    } else {
                        mockOutput = "Code compiled and executed successfully!\nNote: This is a demo environment.";
                    }
                    break;
                    
                default:
                    mockOutput = "Code executed successfully!\nNote: This is a demo environment.";
            }
            
            // Add input to output if provided
            if (input.trim()) {
                mockOutput += `\n\n--- Input provided ---\n${input}`;
            }
            
            setOutput(mockOutput);
            toast.success('Code executed successfully!');
            
        } catch (error) {
            console.error("Execution error:", error);
            toast.error("Failed to execute code: " + error.message);
            setOutput("Error: Failed to execute code - " + error.message);
        } finally {
            setIsExecuting(false);
        }
    };

    // Create hover tooltip extension for CodeMirror with improved styling
    const blameTooltipExtension = hoverTooltip((view, pos) => {
        if (!codeBlame.lastEditor) return null;

        return {
            pos,
            end: pos,
            above: true,
            create() {
                const dom = document.createElement("div");
                const { lastEditor } = codeBlame;

                return { dom };
            }
        };
    });

    // Create a new tooltip extension for line-by-line blame
    const lineBlameTooltipExtension = hoverTooltip((view, pos) => {
        const line = view.state.doc.lineAt(pos);
        const lineIndex = line.number - 1;

        if (!lineBlameData[lineIndex]) return null;

        const lineInfo = lineBlameData[lineIndex];

        return {
            pos: line.from,
            end: line.to,
            above: true,
            create() {
                const dom = document.createElement("div");

                dom.style.backgroundColor = "#1e293b";
                dom.style.color = "white";
                dom.style.padding = "8px 12px";
                dom.style.borderRadius = "6px";
                dom.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                dom.style.display = "flex";
                dom.style.alignItems = "center";
                dom.style.gap = "10px";
                dom.style.zIndex = "9999";
                dom.style.fontFamily = "system-ui, -apple-system, sans-serif";
                dom.style.fontSize = "14px";

                dom.innerHTML = `
                    <img src="${lineInfo.userPhoto}" alt="${lineInfo.userName}" 
                        style="width: 24px; height: 24px; border-radius: 50%;" />
                    <div>
                        <div style="font-weight: 500;">${lineInfo.userName}</div>
                        <div style="font-size: 11px; color: #cbd5e0;">
                            Line ${lineIndex + 1} • Edited ${new Date(lineInfo.timestamp).toLocaleString()}
                        </div>
                    </div>
                `;
                return { dom };
            }
        };
    });

    // A simpler gutter implementation to test
    const commentGutter = gutter({
        class: "cm-comments-gutter",
        renderEmptyElements: true,
        lineMarker(view, line) {
            const lineInfo = view.state.doc.lineAt(line.from);
            const lineNo = lineInfo.number - 1;

            const marker = new class extends GutterMarker {
                toDOM() {
                    const element = document.createElement("div");
                    element.style.cursor = "pointer";
                    element.style.width = "100%";
                    element.style.height = "100%";
                    element.style.display = "flex";
                    element.style.alignItems = "center";
                    element.style.justifyContent = "center";

                    const lineComments = comments[lineNo] || {};
                    const hasComments = Object.keys(lineComments).length > 0;

                    if (hasComments) {
                        const indicator = document.createElement("div");
                        indicator.className = "comment-indicator";
                        indicator.textContent = Object.keys(lineComments).length;
                        indicator.style.backgroundColor = "#8b5cf6";
                        indicator.style.color = "white";
                        indicator.style.borderRadius = "50%";
                        indicator.style.width = "18px";
                        indicator.style.height = "18px";
                        indicator.style.display = "flex";
                        indicator.style.alignItems = "center";
                        indicator.style.justifyContent = "center";
                        indicator.style.fontSize = "12px";
                        element.appendChild(indicator);
                    } else {
                        element.className = "comment-gutter-empty";
                    }

                    element.addEventListener("click", () => {
                        if (hasComments) {
                            setActiveComment(lineNo);
                        } else {
                            handleStartComment(lineNo);
                        }
                    });

                    return element;
                }
            };

            return marker;
        },
        initialSpacer() {
            return new class extends GutterMarker {
                toDOM() {
                    const element = document.createElement("div");
                    return element;
                }
            };
        },
        width: "28px"
    });

    // Update effect to fetch blame data and comments
    useEffect(() => {
        const roomRef = ref(database, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCode(data.code || "");
                setLanguage(data.language || "javascript");
            }
        });

        const roomDetailsRef = ref(database, `rooms/${roomId}`);
        const roomDetailsUnsubscribe = onValue(roomDetailsRef, (snapshot) => {
            const data = snapshot.val() || {};
            const creatorId = data.createdBy;

            const collaboratorsRef = ref(database, `rooms/${roomId}/collaborators`);
            const collaboratorUnsubscribe = onValue(collaboratorsRef, (snapshot) => {
                const collaboratorsData = snapshot.val() || {};
                const collaboratorsList = Object.values(collaboratorsData).map((user) => ({
                    ...user,
                    isCreator: user.id === creatorId,
                }));
                setCollaborators(collaboratorsList);
            });

            return () => collaboratorUnsubscribe();
        });

        const blameRef = ref(database, `rooms/${roomId}/codeBlame`);
        const blameUnsubscribe = onValue(blameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCodeBlame(data);
            }
        });

        const lineBlameRef = ref(database, `rooms/${roomId}/lineBlame`);
        const lineBlameUnsubscribe = onValue(lineBlameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLineBlameData(data);
            }
        });

        const commentsRef = ref(database, `rooms/${roomId}/comments`);
        const commentsUnsubscribe = onValue(commentsRef, (snapshot) => {
            const data = snapshot.val() || {};
            setComments(data);
        });

        return () => {
            unsubscribe();
            roomDetailsUnsubscribe();
            blameUnsubscribe();
            lineBlameUnsubscribe();
            commentsUnsubscribe();
        };
    }, [roomId]);

    // Function to start a new comment
    const handleStartComment = (lineIndex) => {
        setNewCommentLine(lineIndex);
        setActiveComment(null);
        setNewCommentText("");

        setTimeout(() => {
            if (commentInputRef.current) {
                commentInputRef.current.focus();
            }
        }, 10);
    };

    // Function to add a comment to a specific line
    const handleAddComment = () => {
        if (!newCommentText.trim() || newCommentLine === null) return;

        const commentsRef = ref(database, `rooms/${roomId}/comments/${newCommentLine}`);
        const newCommentRef = push(commentsRef);

        set(newCommentRef, {
            text: newCommentText.trim(),
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "Anonymous",
            userPhoto: auth.currentUser.photoURL ||
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            timestamp: Date.now(),
            replies: {}
        });

        setNewCommentLine(null);
        setNewCommentText("");
    };

    // Function to add a reply to a comment
    const handleAddReply = (lineIndex, commentId) => {
        if (!newReplyText.trim()) return;

        const replyRef = ref(database, `rooms/${roomId}/comments/${lineIndex}/${commentId}/replies`);
        const newReplyRef = push(replyRef);

        set(newReplyRef, {
            text: newReplyText.trim(),
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "Anonymous",
            userPhoto: auth.currentUser.photoURL ||
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            timestamp: Date.now()
        });

        setNewReplyText("");
    };

    // Function to delete a comment
    const handleDeleteComment = (lineIndex, commentId) => {
        const commentRef = ref(database, `rooms/${roomId}/comments/${lineIndex}/${commentId}`);
        remove(commentRef);
    };

    // Function to delete a reply
    const handleDeleteReply = (lineIndex, commentId, replyId) => {
        const replyRef = ref(database, `rooms/${roomId}/comments/${lineIndex}/${commentId}/replies/${replyId}`);
        remove(replyRef);
    };

    // Add this helper function to calculate the best position for comment popups
    const calculateCommentPosition = (lineIndex) => {
        const linePosition = (lineIndex + 1) * 21;
        const editorRect = document.querySelector('.cm-editor')?.getBoundingClientRect();

        if (!editorRect) return { top: linePosition };

        const maxTop = Math.min(
            linePosition,
            editorRect.height - 100
        );

        return {
            top: `${maxTop}px`,
            transform: maxTop === linePosition ? 'translateY(-50%)' : 'none'
        };
    };

    return (
        <div className="min-h-screen bg-[#09090f] text-white">
            {/* Header */}
            <div className="bg-[#111119] border-b border-gray-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">                        {/* Logo and Project Info */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">IC</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">Code Editor</h1>
                                    <p className="text-xs text-gray-400">Team Collaboration</p>
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
                                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-violet-600 transition-colors">
                                            <img
                                                src={user.photoURL}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {user.isCreator && (
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 border-2 border-[#111119] rounded-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Last Editor Info */}
                            {codeBlame.lastEditor && (
                                <div className="hidden md:flex items-center text-sm text-gray-400">
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
                        </div>

                        {/* Chat Button, Language Selector and Back Button */}
                        <div className="flex items-center space-x-3">
                            {/* Chat Toggle Button */}
                            <button
                                onClick={toggleChat}
                                className={`relative p-2 bg-[#1a1a23] border border-gray-700 rounded-lg hover:bg-[#2a2a35] transition-colors ${unreadCount > 0 ? 'chat-notification' : ''}`}
                                title="Toggle Chat"
                            >
                                <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="px-3 py-2 bg-[#1a1a23] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
                            >
                                {Object.keys(languageExtensions).map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 px-4 py-2 bg-[#1a1a23] text-gray-300 border border-gray-700 rounded-lg hover:bg-[#2a2a35] hover:text-white transition-colors text-sm font-medium"
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

            {/* Chat Popup */}
            {isChatOpen && (
                <div className="fixed top-20 right-6 w-80 h-96 bg-[#111119] border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col chat-slide-in">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>                            <h3 className="text-lg font-semibold">Team Chat</h3>
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
                        {chatMessages.length === 0 ? (
                            <div className="text-center text-gray-400 mt-8">
                                <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-sm">No messages yet</p>
                                <p className="text-xs">Start a conversation with your team!</p>
                            </div>
                        ) : (
                            chatMessages.map((message) => (
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
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-fit">
                    {/* Left Panel - Editor and Input */}
                    <div className="flex flex-col gap-6">
                        {/* Code Editor */}
                        <div className="flex-1 bg-[#111119] border border-gray-800 rounded-lg overflow-hidden relative">
                            <div className="p-4 border-b border-gray-800">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    Code Editor
                                </h3>
                            </div>
                            <div className="h-[400px] overflow-y-auto">
                                <CodeMirror
                                    value={code}
                                    height="100%"
                                    theme="dark"
                                    extensions={[
                                        languageExtensions[language](),
                                        blameTooltipExtension,
                                        lineBlameTooltipExtension,
                                        commentGutter
                                    ]}
                                    onChange={handleCodeChange}
                                />
                            </div>

                            {/* New comment form */}
                            {newCommentLine !== null && (
                                <div
                                    className="absolute bg-[#111119] border border-gray-700 rounded-lg shadow-lg p-4 z-10"
                                    style={{
                                        top: `${(newCommentLine + 1) * 21 + 64}px`,
                                        right: "20px",
                                        transform: 'translateY(-50%)',
                                        width: '280px',
                                        maxHeight: '80vh',
                                        overflowY: 'auto'
                                    }}>
                                    <textarea
                                        ref={commentInputRef}
                                        className="w-full p-3 bg-[#1a1a23] border border-gray-700 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-gray-400"
                                        rows="3"
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                    ></textarea>
                                    <div className="flex justify-end mt-3 gap-2">
                                        <button
                                            className="px-3 py-1 text-sm bg-transparent text-gray-400 hover:text-white rounded-lg transition-colors"
                                            onClick={() => setNewCommentLine(null)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-3 py-1 text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors"
                                            onClick={handleAddComment}
                                        >
                                            Comment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Comment thread view */}
                            {activeComment !== null && comments[activeComment] && (
                                <div
                                    className="absolute bg-[#111119] border border-gray-700 rounded-lg shadow-lg p-4 z-10 overflow-y-auto"
                                    style={{
                                        ...calculateCommentPosition(activeComment),
                                        right: "20px",
                                        width: '320px',
                                        maxHeight: '80vh',
                                        maxWidth: '90vw'
                                    }}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-medium text-white">Comments on line {activeComment + 1}</h3>
                                        <button
                                            className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                                            onClick={() => setActiveComment(null)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {Object.entries(comments[activeComment]).map(([commentId, comment]) => (
                                        <div key={commentId} className="mb-4 p-3 bg-[#1a1a23] border border-gray-700 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <img src={comment.userPhoto} alt={comment.userName} className="w-6 h-6 rounded-full" />
                                                <div>
                                                    <div className="text-sm font-medium">{comment.userName}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(comment.timestamp).toLocaleString()}
                                                    </div>
                                                </div>

                                                {comment.userId === auth.currentUser.uid && (
                                                    <button
                                                        className="ml-auto text-xs text-gray-400 hover:text-red-400 transition-colors"
                                                        onClick={() => handleDeleteComment(activeComment, commentId)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-sm mb-3">{comment.text}</p>

                                            {/* Replies section */}
                                            {comment.replies && Object.entries(comment.replies).length > 0 && (
                                                <div className="pl-3 border-l border-gray-600 mt-3 space-y-3">
                                                    {Object.entries(comment.replies).map(([replyId, reply]) => (
                                                        <div key={replyId} className="bg-[#2a2a35] p-2 rounded">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <img src={reply.userPhoto} alt={reply.userName} className="w-4 h-4 rounded-full" />
                                                                <div className="text-xs font-medium">{reply.userName}</div>
                                                                <div className="text-xs text-gray-400">
                                                                    {new Date(reply.timestamp).toLocaleString()}
                                                                </div>

                                                                {reply.userId === auth.currentUser.uid && (
                                                                    <button
                                                                        className="ml-auto text-xs text-gray-400 hover:text-red-400 transition-colors"
                                                                        onClick={() => handleDeleteReply(activeComment, commentId, replyId)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-xs">{reply.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Reply input */}
                                            <div className="mt-3 flex gap-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 p-2 text-xs bg-[#2a2a35] border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-gray-400"
                                                    placeholder="Add a reply..."
                                                    value={newReplyText}
                                                    onChange={(e) => setNewReplyText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleAddReply(activeComment, commentId);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    className="px-3 py-1 text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded hover:from-violet-700 hover:to-purple-700 transition-colors"
                                                    onClick={() => handleAddReply(activeComment, commentId)}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        className="w-full py-2 text-xs bg-[#1a1a23] hover:bg-[#2a2a35] text-white rounded-lg mt-2 border border-gray-700 transition-colors"
                                        onClick={() => handleStartComment(activeComment)}
                                    >
                                        Add another comment
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Input Section */}
                        <div className="h-48 bg-[#111119] border border-gray-800 rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-800">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                    </svg>
                                    Input
                                </h3>
                            </div>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full h-[calc(100%-4rem)] p-4 bg-transparent text-white resize-none focus:outline-none placeholder-gray-400"
                                placeholder="Enter input here..."
                            />
                        </div>
                    </div>


                    {/* Right Panel - Controls and Output */}
                    <div className="flex flex-col gap-6">
                        {/* Run Button */}
                        <div className="bg-[#111119] border border-gray-800 rounded-lg p-4">
                            <button
                                onClick={executeCode}
                                disabled={isExecuting}
                                className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isExecuting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Executing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Run Code
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Output Section */}
                        <div className="flex-1 bg-[#111119] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-800 flex-shrink-0">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Output
                                </h3>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <pre className="custom-scrollbar p-4 text-sm text-gray-300 whitespace-pre-wrap h-full overflow-y-auto bg-[#0a0a0f] font-mono">
                                    {output || "Run your code to see the output here..."}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;