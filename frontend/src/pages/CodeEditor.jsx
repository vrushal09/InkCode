import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, database } from "../config/firebase";
import { ref, onValue, set } from "firebase/database";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { toast } from "react-toastify";
import { JDOODLE_CONFIG } from "../config/jdoodle";
// import { Tooltip } from "@uiw/react-tooltip";
import { hoverTooltip } from "@codemirror/view";

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
    const { roomId } = useParams();
    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [isExecuting, setIsExecuting] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [codeBlame, setCodeBlame] = useState({});
    
    // Update your state to track line-by-line blame data
    const [lineBlameData, setLineBlameData] = useState({});

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

    // Update effect to fetch blame data
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
        
        return () => {
            unsubscribe();
            roomDetailsUnsubscribe();
            blameUnsubscribe();
            lineBlameUnsubscribe();
        };
    }, [roomId]);

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
                    <div className="flex-1 card overflow-hidden">
                        <CodeMirror
                            value={code}
                            height="100%"
                            theme="dark"
                            extensions={[
                                languageExtensions[language](),
                                blameTooltipExtension,
                                lineBlameTooltipExtension // Use the line-by-line tooltip
                            ]}
                            onChange={handleCodeChange}
                        />
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
