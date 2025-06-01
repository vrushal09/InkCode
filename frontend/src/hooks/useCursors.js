import { useState, useEffect, useRef, useCallback } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue, set, remove } from "firebase/database";

export const useCursors = (roomId) => {
    const [userCursors, setUserCursors] = useState({});
    const [editorElement, setEditorElement] = useState(null);
    const lastPositionRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Track other users' cursors
    useEffect(() => {
        if (!roomId) return;

        const cursorsRef = ref(database, `rooms/${roomId}/cursors`);
        const unsubscribe = onValue(cursorsRef, (snapshot) => {
            const cursorsData = snapshot.val() || {};
            
            // Filter out current user's cursor
            const otherUsersCursors = Object.entries(cursorsData)
                .filter(([userId]) => userId !== auth.currentUser.uid)
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
    }, [roomId]);

    // Real-time cursor position update with minimal throttling
    const updateCursorPosition = useCallback((x, y, editorRect) => {
        if (!roomId || !editorRect) return;

        // Calculate relative position within the editor
        const relativeX = ((x - editorRect.left) / editorRect.width) * 100;
        const relativeY = ((y - editorRect.top) / editorRect.height) * 100;

        // Only update if position changed (minimal threshold for smooth movement)
        const currentPos = { x: relativeX, y: relativeY };
        if (lastPositionRef.current && 
            Math.abs(lastPositionRef.current.x - relativeX) < 0.1 && 
            Math.abs(lastPositionRef.current.y - relativeY) < 0.1) {
            return;
        }

        lastPositionRef.current = currentPos;

        const userCursorRef = ref(database, `rooms/${roomId}/cursors/${auth.currentUser.uid}`);
        set(userCursorRef, {
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "Anonymous",
            userPhoto: auth.currentUser.photoURL || 
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            x: relativeX,
            y: relativeY,
            timestamp: Date.now()
        });
    }, [roomId]);

    // High-frequency mouse move handler using requestAnimationFrame
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
                
                updateCursorPosition(event.clientX, event.clientY, editorRect);
            }
        });
    }, [editorElement, updateCursorPosition]);

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
        editorElement.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            editorElement.removeEventListener('mousemove', handleMouseMove);
            editorElement.removeEventListener('mouseleave', handleMouseLeave);
            
            // Clean up animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [editorElement, handleMouseMove]);

    return {
        userCursors,
        setEditorElement
    };
};
