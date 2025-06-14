import { useRef, useEffect } from 'react';
import { auth } from '../../config/firebase';

const CommentsSystem = ({
    comments,
    activeComment,
    setActiveComment,
    newCommentLine,
    setNewCommentLine,
    newCommentText,
    setNewCommentText,
    newReplyText,
    setNewReplyText,
    handleAddComment,
    handleAddReply,
    handleDeleteComment,
    handleDeleteReply,
    calculateCommentPosition
}) => {
    const commentInputRef = useRef(null);

    // Focus comment input when creating new comment
    useEffect(() => {
        if (newCommentLine !== null && commentInputRef.current) {
            setTimeout(() => {
                commentInputRef.current.focus();
            }, 10);
        }
    }, [newCommentLine]);    // Calculate safe positioning within viewport
    const getViewportSafePosition = () => {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Account for typical header height and some padding
        const headerHeight = 80; // Estimate for editor header
        const padding = 40;
        const availableHeight = viewportHeight - headerHeight - padding;
        
        // Form dimensions
        const formWidth = Math.min(320, viewportWidth * 0.9);
        const maxFormHeight = Math.min(300, availableHeight * 0.8);
        
        // Position in the center, but ensure it doesn't go below viewport
        const topPosition = Math.max(
            headerHeight + 20, // Don't go above header
            Math.min(
                viewportHeight * 0.4, // Prefer upper-center
                viewportHeight - maxFormHeight - 20 // But ensure it fits
            )
        );
        
        return {
            top: `${topPosition}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${formWidth}px`,
            maxHeight: `${maxFormHeight}px`
        };
    };    // Calculate position for comment threads
    const getCommentThreadPosition = () => {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const headerHeight = 80;
        const padding = 40;
        const availableHeight = viewportHeight - headerHeight - padding;
        
        const threadWidth = Math.min(320, viewportWidth * (viewportWidth < 768 ? 0.85 : 0.3));
        const maxThreadHeight = Math.min(400, availableHeight * 0.8);
        
        const topPosition = Math.max(
            headerHeight + 20,
            Math.min(
                viewportHeight * 0.3,
                viewportHeight - maxThreadHeight - 20
            )
        );
        
        return {
            top: `${topPosition}px`,
            right: viewportWidth < 768 ? '10px' : '20px',
            width: `${threadWidth}px`,
            maxHeight: `${maxThreadHeight}px`
        };
    };    return (
        <div className="relative h-full">
            {/* Backdrop for modals */}
            {(newCommentLine !== null || activeComment !== null) && (
                <div className="fixed inset-0 bg-black/20 z-40" onClick={() => {
                    setNewCommentLine(null);
                    setActiveComment(null);
                }} />
            )}            {/* New comment form - Fixed positioning to stay in viewport */}
            {newCommentLine !== null && (
                <div
                    className="fixed bg-[#0A0A0A] border border-[#242424] rounded-xl shadow-xl p-4 z-50 overflow-y-auto"
                    style={getViewportSafePosition()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-[#FFFFFF]">
                            Add comment to line {newCommentLine + 1}
                        </h3>
                        <button
                            className="p-1 text-[#FFFFFF]/60 hover:text-[#FFFFFF] rounded transition-colors"
                            onClick={() => setNewCommentLine(null)}
                        >
                            ✕
                        </button>
                    </div>
                    <textarea
                        ref={commentInputRef}
                        className="w-full p-3 bg-[#000000] border border-[#242424] rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30 text-[#FFFFFF] placeholder-[#FFFFFF]/50"
                        rows="3"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Add a comment..."
                    />
                    <div className="flex justify-end mt-3 gap-2">
                        <button
                            className="px-3 py-1 text-sm bg-transparent text-[#FFFFFF]/60 hover:text-[#FFFFFF] rounded-lg transition-colors"
                            onClick={() => setNewCommentLine(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-3 py-1 text-sm bg-[#FFFFFF] text-[#000000] rounded-lg hover:bg-[#FFFFFF]/90 transition-colors"
                            onClick={handleAddComment}
                        >
                            Comment
                        </button>
                    </div>
                </div>
            )}            {/* Comment thread view - Fixed positioning with smart placement */}
            {activeComment !== null && comments[activeComment] && (
                <div
                    className="fixed bg-[#0A0A0A] border border-[#242424] rounded-xl shadow-xl p-4 z-50 overflow-y-auto"
                    style={getCommentThreadPosition()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-[#FFFFFF]">
                            Comments on line {activeComment + 1}
                        </h3>
                        <button
                            className="p-1 text-[#FFFFFF]/60 hover:text-[#FFFFFF] rounded transition-colors"
                            onClick={() => setActiveComment(null)}
                        >
                            ✕
                        </button>
                    </div>

                    {Object.entries(comments[activeComment]).map(([commentId, comment]) => (
                        <CommentThread
                            key={commentId}
                            comment={comment}
                            commentId={commentId}
                            activeComment={activeComment}
                            newReplyText={newReplyText}
                            setNewReplyText={setNewReplyText}
                            handleAddReply={handleAddReply}
                            handleDeleteComment={handleDeleteComment}
                            handleDeleteReply={handleDeleteReply}
                        />
                    ))}                    <button
                        className="w-full py-2 text-xs bg-[#242424] hover:bg-[#242424]/80 text-[#FFFFFF] rounded-lg mt-2 border border-[#242424] transition-colors"
                        onClick={() => setNewCommentLine(activeComment)}
                    >
                        Add another comment
                    </button>
                </div>
            )}            {/* Comments summary for the compact area */}
            <div className="h-full p-2 bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-y-auto">
                <h4 className="text-xs font-medium text-[#FFFFFF]/80 mb-2">Comments</h4>
                {Object.keys(comments).length === 0 ? (
                    <p className="text-xs text-[#FFFFFF]/60">No comments yet</p>
                ) : (
                    <div className="space-y-1">
                        {Object.entries(comments).map(([lineNumber, lineComments]) => (
                            <div 
                                key={lineNumber}
                                className="text-xs p-2 bg-[#242424] rounded-lg cursor-pointer hover:bg-[#242424]/80 transition-colors"
                                onClick={() => setActiveComment(parseInt(lineNumber))}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-[#FFFFFF]">Line {parseInt(lineNumber) + 1}</span>
                                    <span className="text-[#FFFFFF]/60">{Object.keys(lineComments).length} comment(s)</span>
                                </div>
                                <p className="text-[#FFFFFF]/80 truncate mt-1">
                                    {Object.values(lineComments)[0]?.text}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentThread = ({
    comment,
    commentId,
    activeComment,
    newReplyText,
    setNewReplyText,
    handleAddReply,
    handleDeleteComment,
    handleDeleteReply
}) => {
    return (
        <div className="mb-4 p-3 bg-[#242424] border border-[#242424] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                <img src={comment.userPhoto} alt={comment.userName} className="w-6 h-6 rounded-full" />
                <div>
                    <div className="text-sm font-medium text-[#FFFFFF]">{comment.userName}</div>
                    <div className="text-xs text-[#FFFFFF]/60">
                        {new Date(comment.timestamp).toLocaleString()}
                    </div>
                </div>

                {comment.userId === auth.currentUser.uid && (
                    <button
                        className="ml-auto text-xs text-[#FFFFFF]/60 hover:text-red-400 transition-colors"
                        onClick={() => handleDeleteComment(activeComment, commentId)}
                    >
                        Delete
                    </button>
                )}
            </div>

            <p className="text-sm mb-3 text-[#FFFFFF]">{comment.text}</p>

            {/* Replies section */}
            {comment.replies && Object.entries(comment.replies).length > 0 && (
                <div className="pl-3 border-l border-[#FFFFFF]/20 mt-3 space-y-3">
                    {Object.entries(comment.replies).map(([replyId, reply]) => (
                        <div key={replyId} className="bg-[#0A0A0A] p-2 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <img src={reply.userPhoto} alt={reply.userName} className="w-4 h-4 rounded-full" />
                                <div className="text-xs font-medium text-[#FFFFFF]">{reply.userName}</div>
                                <div className="text-xs text-[#FFFFFF]/60">
                                    {new Date(reply.timestamp).toLocaleString()}
                                </div>

                                {reply.userId === auth.currentUser.uid && (
                                    <button
                                        className="ml-auto text-xs text-[#FFFFFF]/60 hover:text-red-400 transition-colors"
                                        onClick={() => handleDeleteReply(activeComment, commentId, replyId)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-[#FFFFFF]">{reply.text}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Reply input */}
            <div className="mt-3 flex gap-2">
                <input
                    type="text"
                    className="flex-1 p-2 text-xs bg-[#0A0A0A] border border-[#242424] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 focus:border-[#FFFFFF]/30 text-[#FFFFFF] placeholder-[#FFFFFF]/50"
                    placeholder="Add a reply..."
                    value={newReplyText}
                    onChange={(e) => setNewReplyText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddReply(activeComment, commentId);
                        }
                    }}
                />
                <button
                    className="px-3 py-1 text-xs bg-[#FFFFFF] text-[#000000] rounded-lg hover:bg-[#FFFFFF]/90 transition-colors"
                    onClick={() => handleAddReply(activeComment, commentId)}
                >
                    Reply
                </button>
            </div>
        </div>
    );
};

export default CommentsSystem;
