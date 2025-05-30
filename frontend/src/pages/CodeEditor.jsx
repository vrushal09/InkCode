import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, database } from "../config/firebase";
import { ref, onValue, set, remove } from "firebase/database";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { toast } from "react-toastify";
import { JDOODLE_CONFIG } from "../config/jdoodle";

const languageExtensions = {
    javascript,
    python,
    java,
    cpp
};

const languageIds = {
    javascript: "nodejs",
    python: "python3",
    java: "java",
    cpp: "cpp17"
};

const CodeEditor = () => {
    const { roomId } = useParams();
    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [isExecuting, setIsExecuting] = useState(false);
    const [collaborators, setCollaborators] = useState([]);

    useEffect(() => {
        const roomRef = ref(database, `rooms/${roomId}`);
        const collaboratorsRef = ref(database, `rooms/${roomId}/collaborators`);
        const userRef = ref(database, `rooms/${roomId}/collaborators/${auth.currentUser.uid}`);

        // Add current user to collaborators list
        set(userRef, {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || "Anonymous",
            photoURL: auth.currentUser.photoURL || `https://api.dicebear.com/7.x/avatars/svg?seed=${auth.currentUser.uid}`,
            lastActive: Date.now()
        });

        // Listen to full room data for code/language + creator
        const roomUnsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCode(data.code || "");
                setLanguage(data.language || "javascript");

                // Check creator
                const creatorId = data.createdBy || "";

                // Listen to collaborators
                onValue(collaboratorsRef, (collabSnap) => {
                    const collabData = collabSnap.val() || {};
                    const collabList = Object.values(collabData).map((user) => ({
                        ...user,
                        isCreator: user.id === creatorId
                    }));
                    setCollaborators(collabList);
                });
            }
        });

        return () => {
            roomUnsubscribe();
            remove(userRef); // remove user from collaborators on unmount
        };
    }, [roomId]);

    const handleCodeChange = (value) => {
        setCode(value);
        const roomRef = ref(database, `rooms/${roomId}`);
        set(roomRef, {
            code: value,
            language,
            lastUpdated: Date.now()
        });
    };

    const executeCode = async () => {
        setIsExecuting(true);
        setOutput("");

        try {
            const response = await fetch(JDOODLE_CONFIG.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    clientId: JDOODLE_CONFIG.clientId,
                    clientSecret: JDOODLE_CONFIG.clientSecret,
                    script: code,
                    stdin: input,
                    language: languageIds[language],
                    versionIndex: "0"
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setOutput(data.output);
        } catch (err) {
            toast.error("Failed to execute code: " + err.message);
            setOutput("Error: Failed to execute code");
        } finally {
            setIsExecuting(false);
        }
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
                                className="flex items-center gap-2 px-2 py-1 bg-secondary rounded-full text-sm"
                                title={`${user.name}\nLast active: ${new Date(user.lastActive).toLocaleString()}`}
                            >
                                <img
                                    src={user.photoURL}
                                    alt={user.name}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span>{user.name}</span>
                                {user.isCreator && (
                                    <span className="text-xs bg-primary px-1.5 py-0.5 rounded-full">
                                        Creator
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
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
                            extensions={[languageExtensions[language]()]}
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
