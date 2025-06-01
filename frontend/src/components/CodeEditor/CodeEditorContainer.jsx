import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, database } from "../../config/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { toast } from "react-toastify";

// Import components
import EditorHeader from "./EditorHeader";
import ChatPanel from "./ChatPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import InputPanel from "./InputPanel";
import OutputPanel from "./OutputPanel";
import ControlPanel from "./ControlPanel";
import CommentsSystem from "./CommentsSystem";

// Import hooks and utils
import { useCodeEditor } from "../../hooks/useCodeEditor";
import { useCollaboration } from "../../hooks/useCollaboration";
import { useChat } from "../../hooks/useChat";
import { useComments } from "../../hooks/useComments";
import { useCursors } from "../../hooks/useCursors";
import { codeExecutionService } from "../../services/codeExecutionService";
import { GlobalStyles } from "./GlobalStyles";
import CursorOverlay from "../CursorOverlay";

const CodeEditorContainer = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();

    // Custom hooks for different features
    const {
        code,
        setCode,
        language,
        setLanguage,
        input,
        setInput,
        output,
        setOutput,
        isExecuting,
        handleCodeChange,
        executeCode
    } = useCodeEditor(roomId);

    const {
        collaborators,
        codeBlame,
        lineBlameData
    } = useCollaboration(roomId);

    const {
        isChatOpen,
        setIsChatOpen,
        chatMessages,
        newMessage,
        setNewMessage,
        unreadCount,
        toggleChat,
        sendMessage,
        deleteMessage,
        formatChatTime
    } = useChat(roomId);    const {
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
        calculateCommentPosition
    } = useComments(roomId);    const {
        userCursors,
        setEditorElement
    } = useCursors(roomId);

    // Track editor element for cursor positioning
    const [editorElementRef, setEditorElementRef] = useState(null);

    useEffect(() => {
        if (editorElementRef) {
            setEditorElement(editorElementRef);
        }
    }, [editorElementRef, setEditorElement]);

    // Window dimensions for responsive design
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        function handleResize() {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-[#09090f] text-white">
            <GlobalStyles />
            
            {/* Header */}
            <EditorHeader
                collaborators={collaborators}
                codeBlame={codeBlame}
                language={language}
                setLanguage={setLanguage}
                unreadCount={unreadCount}
                toggleChat={toggleChat}
                navigate={navigate}
            />

            {/* Chat Panel */}
            <ChatPanel
                isOpen={isChatOpen}
                messages={chatMessages}
                collaborators={collaborators}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                unreadCount={unreadCount}
                toggleChat={toggleChat}
                sendMessage={sendMessage}
                deleteMessage={deleteMessage}
                formatChatTime={formatChatTime}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-fit">
                    {/* Left Panel - Editor and Input */}
                    <div className="flex flex-col gap-6">                        {/* Code Editor */}
                        <CodeEditorPanel
                            code={code}
                            language={language}
                            codeBlame={codeBlame}
                            lineBlameData={lineBlameData}
                            comments={comments}
                            handleCodeChange={handleCodeChange}
                            handleStartComment={handleStartComment}
                            setActiveComment={setActiveComment}
                            setEditorElement={setEditorElementRef}
                        />

                        {/* Comments System */}
                        <CommentsSystem
                            comments={comments}
                            activeComment={activeComment}
                            setActiveComment={setActiveComment}
                            newCommentLine={newCommentLine}
                            setNewCommentLine={setNewCommentLine}
                            newCommentText={newCommentText}
                            setNewCommentText={setNewCommentText}
                            newReplyText={newReplyText}
                            setNewReplyText={setNewReplyText}
                            handleAddComment={handleAddComment}
                            handleAddReply={handleAddReply}
                            handleDeleteComment={handleDeleteComment}
                            handleDeleteReply={handleDeleteReply}
                            calculateCommentPosition={calculateCommentPosition}
                        />

                        {/* Input Section */}
                        <InputPanel
                            input={input}
                            setInput={setInput}
                        />
                    </div>

                    {/* Right Panel - Controls and Output */}
                    <div className="flex flex-col gap-6">
                        {/* Control Panel */}
                        <ControlPanel
                            executeCode={executeCode}
                            isExecuting={isExecuting}
                        />

                        {/* Output Section */}
                        <OutputPanel
                            output={output}
                        />
                    </div>                </div>
            </div>            {/* Collaborative Cursors Overlay */}
            <CursorOverlay 
                userCursors={userCursors}
                editorElement={editorElementRef}
            />
        </div>
    );
};

export default CodeEditorContainer;
