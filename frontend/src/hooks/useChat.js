import { useState, useEffect, useRef } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";

export const useChat = (roomId) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastReadTimestamp, setLastReadTimestamp] = useState(Date.now());
    const chatInputRef = useRef(null);
    const chatMessagesRef = useRef(null);

    // Chat functionality
    useEffect(() => {
        if (!roomId) return;

        const chatRef = ref(database, `rooms/${roomId}/chat`);
        const chatUnsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val() || {};
            const messages = Object.entries(data)
                .map(([id, message]) => ({ id, ...message }))
                .sort((a, b) => a.timestamp - b.timestamp);

            setChatMessages(messages);

            // Count unread messages
            if (!isChatOpen) {
                const unread = messages.filter(msg =>
                    msg.timestamp > lastReadTimestamp &&
                    msg.userId !== auth.currentUser.uid
                ).length;
                setUnreadCount(unread);
            }
        });

        return () => chatUnsubscribe();
    }, [roomId, isChatOpen, lastReadTimestamp]);

    // Handle chat open/close
    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) {
            setUnreadCount(0);
            setLastReadTimestamp(Date.now());
            setTimeout(() => {
                if (chatInputRef.current) {
                    chatInputRef.current.focus();
                }
            }, 100);
        }
    };

    // Send chat message
    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const chatRef = ref(database, `rooms/${roomId}/chat`);
        const newMessageRef = push(chatRef);

        set(newMessageRef, {
            text: newMessage.trim(),
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "Anonymous",
            userPhoto: auth.currentUser.photoURL ||
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            timestamp: Date.now()
        });

        setNewMessage("");
    };

    // Delete chat message
    const deleteMessage = (messageId) => {
        const messageRef = ref(database, `rooms/${roomId}/chat/${messageId}`);
        remove(messageRef);
    };

    // Format timestamp for chat
    const formatChatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // Less than 1 minute
            return "just now";
        } else if (diff < 3600000) { // Less than 1 hour
            return `${Math.floor(diff / 60000)}m ago`;
        } else if (diff < 86400000) { // Less than 24 hours
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    };

    return {
        isChatOpen,
        setIsChatOpen,
        chatMessages,
        newMessage,
        setNewMessage,
        unreadCount,
        toggleChat,
        sendMessage,
        deleteMessage,
        formatChatTime,
        chatInputRef,
        chatMessagesRef
    };
};
