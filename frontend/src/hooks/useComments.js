import { useState, useEffect, useRef } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";

export const useComments = (roomId) => {
    const [comments, setComments] = useState({});
    const [activeComment, setActiveComment] = useState(null);
    const [newCommentLine, setNewCommentLine] = useState(null);
    const [newCommentText, setNewCommentText] = useState("");
    const [newReplyText, setNewReplyText] = useState("");
    const commentInputRef = useRef(null);

    // Load comments from Firebase
    useEffect(() => {
        if (!roomId) return;

        const commentsRef = ref(database, `rooms/${roomId}/comments`);
        const commentsUnsubscribe = onValue(commentsRef, (snapshot) => {
            const data = snapshot.val() || {};
            setComments(data);
        });

        return () => commentsUnsubscribe();
    }, [roomId]);

    // Function to start a new comment
    const handleStartComment = (lineIndex) => {
        setNewCommentLine(lineIndex);
        setActiveComment(null);
        setNewCommentText("");

        setTimeout(() => {
            if (commentInputRef.current) {
                commentInputRef.current.focus();
            }
        }, 10);
    };

    // Function to add a comment to a specific line
    const handleAddComment = () => {
        if (!newCommentText.trim() || newCommentLine === null) return;

        const commentsRef = ref(database, `rooms/${roomId}/comments/${newCommentLine}`);
        const newCommentRef = push(commentsRef);

        set(newCommentRef, {
            text: newCommentText.trim(),
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "Anonymous",
            userPhoto: auth.currentUser.photoURL ||
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            timestamp: Date.now(),
            replies: {}
        });

        setNewCommentLine(null);
        setNewCommentText("");
    };

    // Function to add a reply to a comment
    const handleAddReply = (lineIndex, commentId) => {
        if (!newReplyText.trim()) return;

        const replyRef = ref(database, `rooms/${roomId}/comments/${lineIndex}/${commentId}/replies`);
        const newReplyRef = push(replyRef);

        set(newReplyRef, {
            text: newReplyText.trim(),
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || "Anonymous",
            userPhoto: auth.currentUser.photoURL ||
                "https://api.dicebear.com/7.x/avatars/svg?seed=" + auth.currentUser.uid,
            timestamp: Date.now()
        });

        setNewReplyText("");
    };

    // Function to delete a comment
    const handleDeleteComment = (lineIndex, commentId) => {
        const commentRef = ref(database, `rooms/${roomId}/comments/${lineIndex}/${commentId}`);
        remove(commentRef);
    };

    // Function to delete a reply
    const handleDeleteReply = (lineIndex, commentId, replyId) => {
        const replyRef = ref(database, `rooms/${roomId}/comments/${lineIndex}/${commentId}/replies/${replyId}`);
        remove(replyRef);
    };

    // Add this helper function to calculate the best position for comment popups
    const calculateCommentPosition = (lineIndex) => {
        const linePosition = (lineIndex + 1) * 21;
        const editorRect = document.querySelector('.cm-editor')?.getBoundingClientRect();

        if (!editorRect) return { top: linePosition };

        const maxTop = Math.min(
            linePosition,
            editorRect.height - 100
        );

        return {
            top: `${maxTop}px`,
            transform: maxTop === linePosition ? 'translateY(-50%)' : 'none'
        };
    };

    return {
        comments,
        activeComment,
        setActiveComment,
        newCommentLine,
        setNewCommentLine,
        newCommentText,
        setNewCommentText,
        newReplyText,
        setNewReplyText,
        handleStartComment,
        handleAddComment,
        handleAddReply,
        handleDeleteComment,
        handleDeleteReply,
        calculateCommentPosition,
        commentInputRef
    };
};
