import { useState, useEffect } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue, set } from "firebase/database";
import { toast } from "react-toastify";
import { codeExecutionService } from "../services/codeExecutionService";

export const useCodeEditor = (roomId) => {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);

    // Load code and language from Firebase
    useEffect(() => {
        if (!roomId) return;

        const roomRef = ref(database, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCode(data.code || "");
                setLanguage(data.language || "javascript");
            }
        });

        return () => unsubscribe();
    }, [roomId]);

    // Handle code changes with blame tracking
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
    };    // Execute code function
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
