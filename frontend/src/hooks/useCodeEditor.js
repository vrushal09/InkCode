import { useState, useEffect } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue, set } from "firebase/database";
import { toast } from "react-toastify";
import { codeExecutionService } from "../services/codeExecutionService";
import { useUserPreferences } from "../contexts/UserPreferencesContext";

export const useCodeEditor = (roomId, activeFile, getFileContent, updateFileContent, getFileObject) => {
    const { preferences } = useUserPreferences();
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");    const [isExecuting, setIsExecuting] = useState(false);// Load code from active file
    useEffect(() => {
        if (activeFile && getFileContent && getFileObject) {
            const content = getFileContent(activeFile);
            const fileObject = getFileObject(activeFile);
            
            if (content !== null && fileObject) {
                setCode(content);
                  // Use the language stored in the file object, or detect from filename
                if (fileObject.language) {
                    console.log('useCodeEditor - Using stored language:', fileObject.language);
                    setLanguage(fileObject.language);
                } else {
                    // Fallback: determine language from file extension using original filename
                    const fileName = fileObject.name || activeFile.split('/').pop();
                    const extension = fileName.split('.').pop()?.toLowerCase();
                    const languageMap = {
                        'js': 'javascript',
                        'jsx': 'javascript',
                        'ts': 'typescript',
                        'tsx': 'typescript',
                        'py': 'python',
                        'java': 'java',
                        'cpp': 'cpp',
                        'c': 'c',
                        'html': 'html',
                        'css': 'css',
                        'json': 'json',
                        'md': 'markdown'
                    };
                      const detectedLanguage = languageMap[extension] || 'javascript';
                    console.log('useCodeEditor - Detected language from extension:', extension, '->', detectedLanguage);
                    setLanguage(detectedLanguage);
                }
            }
        } else {
            setCode("");
        }
    }, [activeFile, getFileContent, getFileObject]);

    // Load code and language from Firebase (legacy support)
    useEffect(() => {
        if (!roomId) return;

        const roomRef = ref(database, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data && !activeFile) {
                // Only use Firebase data if no active file is selected
                setCode(data.code || "");
                setLanguage(data.language || "javascript");
            }
        });

        return () => unsubscribe();
    }, [roomId, activeFile]);    // Handle code changes with immediate save (old way)
    const handleCodeChange = (value) => {
        // Only proceed if this is actually a code change (not from terminal or other inputs)
        if (value === code) return; // No change detected
        
        setCode(value);
        
        // Immediate save without delays or notifications
        if (activeFile && updateFileContent) {
            updateFileContent(activeFile, value);
        }
        
        // Also update Firebase for backwards compatibility
        if (roomId) {
            saveToFirebase(value);
        }
    };
    
    // Separate function to save to Firebase
    const saveToFirebase = (value) => {
        if (!roomId) return;
        
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
        }, { onlyOnce: true });    };
    
    // Execute code function
    const executeCode = async () => {
        setIsExecuting(true);
        setOutput("");

        try {
            const result = await codeExecutionService.executeCode(code, language, input);
            setOutput(result);
            toast.success('Code executed successfully!');
            
        } catch (error) {
            console.error("Execution error:", error);
            toast.error("Failed to execute code: " + error.message);
            setOutput("Error: Failed to execute code - " + error.message);
        } finally {
            setIsExecuting(false);
        }
    };

    return {
        code,
        setCode,
        language,
        setLanguage,
        input,
        setInput,
        output,
        setOutput,
        isExecuting,
        handleCodeChange,
        executeCode
    };
};
