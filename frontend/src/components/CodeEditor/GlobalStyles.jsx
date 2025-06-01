import { useEffect } from 'react';

export const GlobalStyles = () => {
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

    return null;
};
