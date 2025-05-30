import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { auth, database } from "../config/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { toast } from "react-toastify";
import { JDOODLE_CONFIG } from "../config/jdoodle";
import { hoverTooltip } from "@codemirror/view";
import { EditorView, gutter, GutterMarker } from "@codemirror/view";

const languageExtensions = {
    javascript,
    python,
    java,
    cpp,
};

const languageIds = {
    javascript: "nodejs",
    python: "python3",
    java: "java",
    cpp: "cpp17",
};

const CodeEditor = () => {
    useEffect(() => {
        // Add CSS for comment indicators
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
                background-color: rgba(59, 130, 246, 0.7);
                border-radius: 50%;
                margin: 0 auto;
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
        });

        // Track collaborators and creator
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

        // Add current user to collaborators
        const userRef = ref(database, `rooms/${roomId}/collaborators/${auth.currentUser.uid}`);
        set(userRef, {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || "Anonymous",
            photoURL:
                auth.currentUser.photoURL ||
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            lastActive: Date.now(),
            isCreator: false, // Will be updated after creator check
        });

        return () => {
            unsubscribe();
            roomDetailsUnsubscribe();
            // Remove user from collaborators on leaving
            set(userRef, null);
        };
    }, [roomId]);

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
    };
    
    const executeCode = async () => {
        setIsExecuting(true);
        setOutput("");

        try {
            const response = await fetch(JDOODLE_CONFIG.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cross-Origin-Opener-Policy": "same-origin",
                },
                body: JSON.stringify({
                    clientId: JDOODLE_CONFIG.clientId,
                    clientSecret: JDOODLE_CONFIG.clientSecret,
                    script: code,
                    stdin: input,
                    language: languageIds[language],
                    versionIndex: "0",
                }),
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setOutput(data.output);
        } catch (error) {
            toast.error("Failed to execute code: " + error.message);
            setOutput("Error: Failed to execute code");
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
        // Get the line number at cursor position
        const line = view.state.doc.lineAt(pos);
        const lineIndex = line.number - 1; // Convert to 0-indexed
        
        // Check if we have blame data for this line
        if (!lineBlameData[lineIndex]) return null;
        
        const lineInfo = lineBlameData[lineIndex];
        
        return {
            pos: line.from,
            end: line.to,
            above: true,
            create() {
                const dom = document.createElement("div");
                
                // Apply styling
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
            
            // Create a basic marker for each line
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
                        // Create a properly styled comment indicator
                        const indicator = document.createElement("div");
                        indicator.className = "comment-indicator";
                        indicator.textContent = Object.keys(lineComments).length;
                        indicator.style.backgroundColor = "#3b82f6";
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
                        // Create a "+" on hover effect through CSS
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
        // Set a fixed width for the gutter to ensure proper display
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

        // Track collaborators and creator
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

        // Add listener for blame data
        const blameRef = ref(database, `rooms/${roomId}/codeBlame`);
        const blameUnsubscribe = onValue(blameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCodeBlame(data);
            }
        });
        
        // Add listener for line blame data
        const lineBlameRef = ref(database, `rooms/${roomId}/lineBlame`);
        const lineBlameUnsubscribe = onValue(lineBlameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLineBlameData(data);
            }
        });
        
        // Add listener for comments
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
        
        // Focus the input after rendering
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
        // Basic calculation of line position
        const linePosition = (lineIndex + 1) * 21;
        
        // Get editor container dimensions (assuming there's a ref to the container)
        const editorRect = document.querySelector('.cm-editor')?.getBoundingClientRect();
        
        if (!editorRect) return { top: linePosition };
        
        // Calculate maximum position to avoid cutoff at bottom
        const maxTop = Math.min(
            linePosition,
            editorRect.height - 100 // Leave some space at the bottom
        );
        
        return {
            top: `${maxTop}px`,
            transform: maxTop === linePosition ? 'translateY(-50%)' : 'none'
        };
    };

    return (
        <div className="min-h-screen p-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">Room ID: {roomId}</h2>
                    <div className="flex items-center gap-2">
                        {collaborators.map((user) => (
                            <div
                                key={user.id}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-secondary`}
                                title={`${user.name}\nLast active: ${new Date(
                                    user.lastActive
                                ).toLocaleString()}`}
                            >
                                <img
                                    src={user.photoURL}
                                    alt={user.name}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span>{user.name}</span>
                                {user.isCreator && (
                                    <span className="text-xs font-bold text-white bg-blue-600 rounded-full px-2 py-0.5">
                                        C
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Add last editor info */}
                {codeBlame.lastEditor && (
                    <div className="flex items-center text-sm text-gray-400 mx-4">
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
                
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input"
                >
                    {Object.keys(languageIds).map((lang) => (
                        <option key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Editor */}
            <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                    <div className="flex-1 card overflow-hidden relative">
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
                        
                        {/* New comment form */}
                        {newCommentLine !== null && (
                            <div 
                                className="absolute bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3 z-10"
                                style={{ 
                                    top: `${(newCommentLine + 1) * 21}px`,
                                    right: "20px", // Fixed right position
                                    transform: 'translateY(-50%)',
                                    width: '280px',
                                    maxHeight: '80vh',
                                    overflowY: 'auto'
                                }}>
                                <textarea
                                    ref={commentInputRef}
                                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded resize-none text-sm focus:outline-none focus:border-blue-500"
                                    rows="3"
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                ></textarea>
                                <div className="flex justify-end mt-2 gap-2">
                                    <button 
                                        className="px-3 py-1 text-xs bg-transparent text-gray-400 hover:text-white rounded"
                                        onClick={() => setNewCommentLine(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
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
                                className="absolute bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 z-10 overflow-y-auto"
                                style={{ 
                                    ...calculateCommentPosition(activeComment),
                                    right: "20px",
                                    width: '320px',
                                    maxHeight: '80vh',
                                    maxWidth: '90vw'
                                }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-medium text-white">Comments on line {activeComment + 1}</h3>
                                    <button 
                                        className="p-1 text-gray-400 hover:text-white rounded"
                                        onClick={() => setActiveComment(null)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                {Object.entries(comments[activeComment]).map(([commentId, comment]) => (
                                    <div key={commentId} className="mb-4 p-3 bg-gray-900 rounded-lg">
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
                                                    className="ml-auto text-xs text-gray-400 hover:text-red-500"
                                                    onClick={() => handleDeleteComment(activeComment, commentId)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                        
                                        <p className="text-sm mb-3">{comment.text}</p>
                                        
                                        {/* Replies section */}
                                        {comment.replies && Object.entries(comment.replies).length > 0 && (
                                            <div className="pl-3 border-l border-gray-700 mt-3 space-y-3">
                                                {Object.entries(comment.replies).map(([replyId, reply]) => (
                                                    <div key={replyId} className="bg-gray-800 p-2 rounded">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <img src={reply.userPhoto} alt={reply.userName} className="w-4 h-4 rounded-full" />
                                                            <div className="text-xs font-medium">{reply.userName}</div>
                                                            <div className="text-xs text-gray-400">
                                                                {new Date(reply.timestamp).toLocaleString()}
                                                            </div>
                                                            
                                                            {reply.userId === auth.currentUser.uid && (
                                                                <button 
                                                                    className="ml-auto text-xs text-gray-400 hover:text-red-500"
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
                                                className="flex-1 p-2 text-xs bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
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
                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                onClick={() => handleAddReply(activeComment, commentId)}
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                <button 
                                    className="w-full py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg mt-2"
                                    onClick={() => handleStartComment(activeComment)}
                                >
                                    Add another comment
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="h-1/3 card overflow-hidden">
                        <h3 className="text-lg font-medium mb-2">Input</h3>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-[calc(100%-2rem)] bg-transparent resize-none focus:outline-none"
                            placeholder="Enter input here..."
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="card mb-4">
                        <button
                            onClick={executeCode}
                            disabled={isExecuting}
                            className="btn btn-primary w-full"
                        >
                            {isExecuting ? "Executing..." : "Run Code"}
                        </button>
                    </div>
                    <div className="flex-1 card overflow-hidden">
                        <h3 className="text-lg font-medium mb-2">Output</h3>
                        <pre className="whitespace-pre-wrap h-[calc(100%-2rem)] overflow-auto">
                            {output}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
