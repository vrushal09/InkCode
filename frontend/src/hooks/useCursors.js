import { useState, useEffect, useRef, useCallback } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue, set, remove } from "firebase/database";

export const useCursors = (roomId) => {
    const [userCursors, setUserCursors] = useState({});
    const [editorElement, setEditorElement] = useState(null);
    const throttleRef = useRef(null);
    const lastPositionRef = useRef(null);    // Track other users' cursors
    useEffect(() => {
        if (!roomId) return;

        const cursorsRef = ref(database, `rooms/${roomId}/cursors`);
        const unsubscribe = onValue(cursorsRef, (snapshot) => {
            const cursorsData = snapshot.val() || {};
            
            // Filter out current user's cursor and stale cursors
            const otherUsersCursors = Object.entries(cursorsData)
                .filter(([userId, cursorData]) => {
                    const isCurrentUser = userId === auth.currentUser.uid;
                    const isStale = Date.now() - cursorData.timestamp > 15000; // 15 seconds
                    return !isCurrentUser && !isStale;
                })
                .reduce((acc, [userId, cursorData]) => {
                    acc[userId] = cursorData;
                    return acc;
                }, {});
            
            setUserCursors(otherUsersCursors);
        }, (error) => {
            console.warn('Error listening to cursors:', error);
        });

        // Cleanup interval to remove stale cursors
        const cleanupInterval = setInterval(() => {
            if (roomId) {
                const cursorsRef = ref(database, `rooms/${roomId}/cursors`);
                onValue(cursorsRef, (snapshot) => {
                    const cursorsData = snapshot.val() || {};
                    const now = Date.now();
                    
                    Object.entries(cursorsData).forEach(([userId, cursorData]) => {
                        if (now - cursorData.timestamp > 30000) { // 30 seconds
                            const staleCursorRef = ref(database, `rooms/${roomId}/cursors/${userId}`);
                            remove(staleCursorRef).catch(err => 
                                console.warn('Error removing stale cursor:', err)
                            );
                        }
                    });
                }, { onlyOnce: true });
            }
        }, 10000); // Clean up every 10 seconds

        return () => {
            unsubscribe();
            clearInterval(cleanupInterval);
            // Remove current user's cursor when leaving
            if (roomId && auth.currentUser) {
                const userCursorRef = ref(database, `rooms/${roomId}/cursors/${auth.currentUser.uid}`);
                remove(userCursorRef).catch(err => 
                    console.warn('Error removing user cursor:', err)
                );
            }
        };
    }, [roomId]);    // Throttled function to update cursor position
    const updateCursorPosition = useCallback((x, y, editorRect) => {
        if (!roomId || !editorRect || !auth.currentUser) return;

        try {
            // Calculate relative position within the editor with bounds checking
            const relativeX = Math.max(0, Math.min(100, ((x - editorRect.left) / editorRect.width) * 100));
            const relativeY = Math.max(0, Math.min(100, ((y - editorRect.top) / editorRect.height) * 100));

            // Only update if position changed significantly (reduces Firebase writes)
            const currentPos = { x: relativeX, y: relativeY };
            if (lastPositionRef.current && 
                Math.abs(lastPositionRef.current.x - relativeX) < 0.3 && 
                Math.abs(lastPositionRef.current.y - relativeY) < 0.3) {
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
            }).catch(error => {
                console.warn('Error updating cursor position:', error);
            });
        } catch (error) {
            console.warn('Error in updateCursorPosition:', error);
        }
    }, [roomId]);// Throttled mouse move handler
    const handleMouseMove = useCallback((event) => {
        if (!editorElement) return;

        // Clear previous throttle
        if (throttleRef.current) {
            clearTimeout(throttleRef.current);
        }

        // Throttle updates to avoid too many Firebase writes
        throttleRef.current = setTimeout(() => {
            const editorRect = editorElement.getBoundingClientRect();
            
            // Check if mouse is within editor bounds with some padding
            const padding = 10;
            if (event.clientX >= (editorRect.left - padding) && 
                event.clientX <= (editorRect.right + padding) && 
                event.clientY >= (editorRect.top - padding) && 
                event.clientY <= (editorRect.bottom + padding)) {
                
                updateCursorPosition(event.clientX, event.clientY, editorRect);
            }
        }, 33); // Throttle to ~30fps for smoother movement
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
            
            // Clean up throttle
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
            }
        };
    }, [editorElement, handleMouseMove]);

    return {
        userCursors,
        setEditorElement
    };
};
