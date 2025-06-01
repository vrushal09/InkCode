import React, { useEffect, useState, useMemo } from 'react';

const CursorOverlay = ({ userCursors, editorElement }) => {
    const [visibleCursors, setVisibleCursors] = useState({});
    const [fadingCursors, setFadingCursors] = useState(new Set());

    // Track cursor visibility for animations
    useEffect(() => {
        const newVisibleCursors = {};
        const newFadingCursors = new Set();
        
        Object.keys(userCursors).forEach(userId => {
            const cursor = userCursors[userId];
            const timeSinceUpdate = Date.now() - cursor.timestamp;
            const isStale = timeSinceUpdate > 15000; // 15 seconds
            const isVeryStale = timeSinceUpdate > 30000; // 30 seconds
            
            if (!isVeryStale) {
                newVisibleCursors[userId] = cursor;
                if (isStale) {
                    newFadingCursors.add(userId);
                }
            }
        });
        
        setVisibleCursors(newVisibleCursors);
        setFadingCursors(newFadingCursors);
    }, [userCursors]);

    // Memoize editor rect to avoid recalculation
    const editorRect = useMemo(() => {
        return editorElement ? editorElement.getBoundingClientRect() : null;
    }, [editorElement, Object.keys(visibleCursors).length]);

    if (!editorElement || !editorRect || Object.keys(visibleCursors).length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-0 z-50">
            {Object.entries(visibleCursors).map(([userId, cursor]) => {
                // Calculate absolute position based on relative percentages
                const absoluteX = editorRect.left + (cursor.x / 100) * editorRect.width;
                const absoluteY = editorRect.top + (cursor.y / 100) * editorRect.height;

                // Skip if cursor is outside viewport
                if (absoluteX < -50 || absoluteY < -50 || 
                    absoluteX > window.innerWidth + 50 || 
                    absoluteY > window.innerHeight + 50) {
                    return null;
                }

                const isFading = fadingCursors.has(userId);
                const cursorState = cursor.state || 'normal';

                return (
                    <div
                        key={userId}
                        className={`absolute collaborative-cursor cursor-fade-in ${isFading ? 'opacity-50' : 'opacity-100'}`}
                        style={{
                            left: `${absoluteX}px`,
                            top: `${absoluteY}px`,
                            transform: 'translate(-2px, -2px)',
                            transition: 'left 50ms ease-out, top 50ms ease-out, opacity 1s ease-out',
                        }}
                    >
                        {/* User name label - moved to top */}
                        <div
                            className="absolute -top-10 left-0 px-2 py-1 rounded-md text-xs font-medium text-white shadow-lg whitespace-nowrap cursor-label"
                            style={{
                                backgroundColor: getCursorColor(userId),
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                minWidth: '60px',
                                maxWidth: '150px'
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <img
                                    src={cursor.userPhoto}
                                    alt={cursor.userName}
                                    className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                                    onError={(e) => {
                                        e.target.src = `https://api.dicebear.com/7.x/avatars/svg?seed=${userId}`;
                                    }}
                                />
                                <span className="text-xs font-semibold truncate">
                                    {cursor.userName || 'Anonymous'}
                                </span>                                {/* Typing indicator */}
                                {cursorState === 'typing' && (
                                    <div className="flex items-center gap-0.5 ml-1">
                                        <div className="w-1 h-1 bg-white rounded-full typing-dot"></div>
                                        <div className="w-1 h-1 bg-white rounded-full typing-dot"></div>
                                        <div className="w-1 h-1 bg-white rounded-full typing-dot"></div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Small triangle pointer pointing down */}
                            <div 
                                className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"
                                style={{ backgroundColor: getCursorColor(userId) }}
                            />
                        </div>

                        {/* Cursor pointer */}
                        <div className="relative">
                            {cursorState === 'typing' ? (
                                // Typing cursor - text cursor with blinking line
                                <div className="relative">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="drop-shadow-lg filter"
                                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                    >
                                        {/* Text cursor I-beam */}
                                        <path
                                            d="M8 4H16M8 20H16M12 4V20"
                                            stroke={getCursorColor(userId)}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            fill="none"
                                        />
                                        <path
                                            d="M8 4H16M8 20H16M12 4V20"
                                            stroke="#ffffff"
                                            strokeWidth="1"
                                            strokeLinecap="round"
                                            fill="none"
                                        />
                                    </svg>                                    {/* Blinking line indicator */}
                                    <div 
                                        className="absolute top-1 left-2.5 w-0.5 h-4 typing-cursor-blink"
                                        style={{ backgroundColor: getCursorColor(userId) }}
                                    />
                                </div>
                            ) : (
                                // Normal cursor - arrow pointer
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="drop-shadow-lg filter"
                                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                                >
                                    {/* Cursor arrow */}
                                    <path
                                        d="M5 3L19 12L12 14L9 21L5 3Z"
                                        fill={getCursorColor(userId)}
                                        stroke="#ffffff"
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Generate a consistent color for each user based on their ID
const getCursorColor = (userId) => {
    const colors = [
        '#8b5cf6', // violet
        '#06b6d4', // cyan
        '#10b981', // emerald
        '#f59e0b', // amber
        '#ef4444', // red
        '#ec4899', // pink
        '#8b5a3c', // orange
        '#6366f1', // indigo
        '#84cc16', // lime
        '#f97316', // orange
    ];
    
    // Create a simple hash from userId to get consistent color
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
};

export default CursorOverlay;
