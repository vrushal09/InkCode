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
    }, [newCommentLine]);

    return (
        <>
            {/* New comment form */}
            {newCommentLine !== null && (
                <div
                    className="absolute bg-[#111119] border border-gray-700 rounded-lg shadow-lg p-4 z-10"
                    style={{
                        top: `${(newCommentLine + 1) * 21 + 64}px`,
                        right: "20px",
                        transform: 'translateY(-50%)',
                        width: '280px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}
                >
                    <textarea
                        ref={commentInputRef}
                        className="w-full p-3 bg-[#1a1a23] border border-gray-700 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-gray-400"
                        rows="3"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Add a comment..."
                    />
                    <div className="flex justify-end mt-3 gap-2">
                        <button
                            className="px-3 py-1 text-sm bg-transparent text-gray-400 hover:text-white rounded-lg transition-colors"
                            onClick={() => setNewCommentLine(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-3 py-1 text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors"
                            onClick={handleAddComment}
                        >
                            Comment
                        </button>
                    </div>
                </div>
            )}

            {/* Comment thread view */}
            {activeComment !== null && comments[activeComment] && (
                <div
                    className="absolute bg-[#111119] border border-gray-700 rounded-lg shadow-lg p-4 z-10 overflow-y-auto"
                    style={{
                        ...calculateCommentPosition(activeComment),
                        right: "20px",
                        width: '320px',
                        maxHeight: '80vh',
                        maxWidth: '90vw'
                    }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-white">
                            Comments on line {activeComment + 1}
                        </h3>
                        <button
                            className="p-1 text-gray-400 hover:text-white rounded transition-colors"
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
                    ))}

                    <button
                        className="w-full py-2 text-xs bg-[#1a1a23] hover:bg-[#2a2a35] text-white rounded-lg mt-2 border border-gray-700 transition-colors"
                        onClick={() => setNewCommentLine(activeComment)}
                    >
                        Add another comment
                    </button>
                </div>
            )}
        </>
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
        <div className="mb-4 p-3 bg-[#1a1a23] border border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <img src={comment.userPhoto} alt={comment.userName} className="w-6 h-6 rounded-full" />
                <div>
                    <div className="text-sm font-medium">{comment.userName}</div>
                    <div className="text-xs text-gray-400">
                        {new Date(comment.timestamp).toLocaleString()}
                    </div>
                </div>

                {comment.userId === auth.currentUser.uid && (
                    <button
                        className="ml-auto text-xs text-gray-400 hover:text-red-400 transition-colors"
                        onClick={() => handleDeleteComment(activeComment, commentId)}
                    >
                        Delete
                    </button>
                )}
            </div>

            <p className="text-sm mb-3">{comment.text}</p>

            {/* Replies section */}
            {comment.replies && Object.entries(comment.replies).length > 0 && (
                <div className="pl-3 border-l border-gray-600 mt-3 space-y-3">
                    {Object.entries(comment.replies).map(([replyId, reply]) => (
                        <div key={replyId} className="bg-[#2a2a35] p-2 rounded">
                            <div className="flex items-center gap-2 mb-1">
                                <img src={reply.userPhoto} alt={reply.userName} className="w-4 h-4 rounded-full" />
                                <div className="text-xs font-medium">{reply.userName}</div>
                                <div className="text-xs text-gray-400">
                                    {new Date(reply.timestamp).toLocaleString()}
                                </div>

                                {reply.userId === auth.currentUser.uid && (
                                    <button
                                        className="ml-auto text-xs text-gray-400 hover:text-red-400 transition-colors"
                                        onClick={() => handleDeleteReply(activeComment, commentId, replyId)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <p className="text-xs">{reply.text}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Reply input */}
            <div className="mt-3 flex gap-2">
                <input
                    type="text"
                    className="flex-1 p-2 text-xs bg-[#2a2a35] border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-gray-400"
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
                    className="px-3 py-1 text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded hover:from-violet-700 hover:to-purple-700 transition-colors"
                    onClick={() => handleAddReply(activeComment, commentId)}
                >
                    Reply
                </button>
            </div>
        </div>
    );
};

export default CommentsSystem;
