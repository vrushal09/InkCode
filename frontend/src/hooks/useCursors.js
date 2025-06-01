import { useState, useEffect, useRef, useCallback } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue, set, remove } from "firebase/database";

export const useCursors = (roomId, activeFile) => {
    const [userCursors, setUserCursors] = useState({});
    const [editorElement, setEditorElement] = useState(null);
    const lastPositionRef = useRef(null);
    const animationFrameRef = useRef(null);    // Track other users' cursors
    useEffect(() => {
        if (!roomId) return;

        const cursorsRef = ref(database, `rooms/${roomId}/cursors`);
        const unsubscribe = onValue(cursorsRef, (snapshot) => {
            const cursorsData = snapshot.val() || {};
            
            // Filter out current user's cursor and only show cursors for same active file
            const otherUsersCursors = Object.entries(cursorsData)
                .filter(([userId]) => userId !== auth.currentUser.uid)
                .filter(([userId, cursorData]) => {
                    // Only show cursors if user is viewing the same file
                    return cursorData.activeFile === activeFile;
                })
                .reduce((acc, [userId, cursorData]) => {
                    acc[userId] = cursorData;
                    return acc;
                }, {});
            
            setUserCursors(otherUsersCursors);
        });

        return () => {
            unsubscribe();
            // Remove current user's cursor when leaving
            const userCursorRef = ref(database, `rooms/${roomId}/cursors/${auth.currentUser.uid}`);
            remove(userCursorRef);
        };
    }, [roomId, activeFile]);

    // Update active file in cursor data when it changes
    useEffect(() => {
        if (!roomId || !activeFile) return;

        // Update the active file for the current user's cursor
        const userCursorRef = ref(database, `rooms/${roomId}/cursors/${auth.currentUser.uid}`);
        
        // First check if cursor exists, then update only the activeFile
        onValue(userCursorRef, (snapshot) => {
            const currentCursor = snapshot.val();
            if (currentCursor) {
                set(userCursorRef, {
                    ...currentCursor,
                    activeFile: activeFile,
                    timestamp: Date.now()
                });
            }
        }, { onlyOnce: true });
    }, [activeFile, roomId]);// Track typing state
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Real-time cursor position update with minimal throttling
    const updateCursorPosition = useCallback((x, y, editorRect, cursorState = 'normal') => {
        if (!roomId || !editorRect) return;

        // Calculate relative position within the editor
        const relativeX = ((x - editorRect.left) / editorRect.width) * 100;
        const relativeY = ((y - editorRect.top) / editorRect.height) * 100;

        // Only update if position changed (minimal threshold for smooth movement)
        const currentPos = { x: relativeX, y: relativeY };
        if (lastPositionRef.current && 
            Math.abs(lastPositionRef.current.x - relativeX) < 0.1 && 
            Math.abs(lastPositionRef.current.y - relativeY) < 0.1 &&
            cursorState === 'normal') {
            return;
        }

        lastPositionRef.current = currentPos;        const userCursorRef = ref(database, `rooms/${roomId}/cursors/${auth.currentUser.uid}`);
        set(userCursorRef, {
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "Anonymous",
            userPhoto: auth.currentUser.photoURL || 
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            x: relativeX,
            y: relativeY,
            state: cursorState, // 'normal', 'typing'
            activeFile: activeFile, // Track which file the user is viewing
            timestamp: Date.now()
        });
    }, [roomId, activeFile]);    // High-frequency mouse move handler using requestAnimationFrame
    const handleMouseMove = useCallback((event) => {
        if (!editorElement) return;

        // Cancel previous animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Use requestAnimationFrame for smooth 60fps updates
        animationFrameRef.current = requestAnimationFrame(() => {
            const editorRect = editorElement.getBoundingClientRect();
            
            // Check if mouse is within editor bounds
            if (event.clientX >= editorRect.left && 
                event.clientX <= editorRect.right && 
                event.clientY >= editorRect.top && 
                event.clientY <= editorRect.bottom) {
                
                const cursorState = isTyping ? 'typing' : 'normal';
                updateCursorPosition(event.clientX, event.clientY, editorRect, cursorState);
            }
        });
    }, [editorElement, updateCursorPosition, isTyping]);

    // Handle typing state detection
    const handleTyping = useCallback(() => {
        setIsTyping(true);
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Set timeout to reset typing state after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    }, []);    // Set up editor content change detection for typing state
    useEffect(() => {
        if (!editorElement) return;

        const handleKeyPress = () => {
            handleTyping();
        };

        const handleInput = () => {
            handleTyping();
        };

        const handleTypingEvent = () => {
            handleTyping();
        };

        editorElement.addEventListener('keydown', handleKeyPress);
        editorElement.addEventListener('input', handleInput);
        editorElement.addEventListener('typing', handleTypingEvent);

        return () => {
            editorElement.removeEventListener('keydown', handleKeyPress);
            editorElement.removeEventListener('input', handleInput);
            editorElement.removeEventListener('typing', handleTypingEvent);
        };
    }, [editorElement, handleTyping]);

    // Set up mouse tracking
    useEffect(() => {
        if (!editorElement) return;

        const handleMouseLeave = () => {
            // Remove cursor when mouse leaves editor
            if (roomId) {
                const userCursorRef = ref(database, `rooms/${roomId}/cursors/${auth.currentUser.uid}`);
                remove(userCursorRef);
            }
        };

        editorElement.addEventListener('mousemove', handleMouseMove);
        editorElement.addEventListener('mouseleave', handleMouseLeave);        return () => {
            editorElement.removeEventListener('mousemove', handleMouseMove);
            editorElement.removeEventListener('mouseleave', handleMouseLeave);
            
            // Clean up animation frame and typing timeout
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [editorElement, handleMouseMove]);

    return {
        userCursors,
        setEditorElement
    };
};
