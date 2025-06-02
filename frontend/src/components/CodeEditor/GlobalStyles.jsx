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
            }            /* Chat notification pulse */
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

            /* Comment modal positioning safety */
            .comment-modal {
                position: fixed !important;
                max-width: 90vw !important;
                max-height: 70vh !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 50 !important;
                overflow-y: auto !important;
            }
            
            .comment-thread-modal {
                position: fixed !important;
                max-width: 30vw !important;
                max-height: 70vh !important;
                top: 20% !important;
                right: 20px !important;
                z-index: 50 !important;
                overflow-y: auto !important;
            }
            
            @media (max-width: 768px) {
                .comment-thread-modal {
                    max-width: 85vw !important;
                    right: 10px !important;
                }
            }

            /* Collaborative cursor styles */}
            .collaborative-cursor {
                pointer-events: none;
                z-index: 1000;
                transition: all 75ms cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
            }

            .cursor-fade-in {
                animation: cursorFadeIn 200ms ease-out;
            }

            @keyframes cursorFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.8) translate(-2px, -2px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translate(-2px, -2px);
                }
            }

            .cursor-label {
                animation: labelSlideIn 250ms ease-out;
                backdrop-filter: blur(4px);
            }

            @keyframes labelSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(5px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Typing cursor animation */
            .typing-cursor-blink {
                animation: typingBlink 1s infinite;
            }

            @keyframes typingBlink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }

            /* Typing indicator dots animation */
            .typing-dot {
                animation: typingDot 1.4s infinite ease-in-out;
            }

            .typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes typingDot {
                0%, 80%, 100% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            /* Improve CodeMirror cursor tracking */
            .cm-editor {
                position: relative;
            }

            .cm-content {
                position: relative;
            }
                position: relative;
            }

            .cm-content {
                position: relative;
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
