import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, database } from "../../config/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { toast } from "react-toastify";

// Import components
import EditorHeader from "./EditorHeader";
import ChatPanel from "./ChatPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import EnhancedCodeEditorPanel from "./EnhancedCodeEditorPanel";
import InputPanel from "./InputPanel";
import OutputPanel from "./OutputPanel";
import ControlPanel from "./ControlPanel";
import CommentsSystem from "./CommentsSystem";
import FileExplorer from "../FileExplorer";
import FileTabs from "../FileTabs";

// Import hooks and utils
import { useCodeEditor } from "../../hooks/useCodeEditor";
import { useCollaboration } from "../../hooks/useCollaboration";
import { useChat } from "../../hooks/useChat";
import { useComments } from "../../hooks/useComments";
import { useCursors } from "../../hooks/useCursors";
import { useFileSystem } from "../../hooks/useFileSystem";
import { codeExecutionService } from "../../services/codeExecutionService";
import { GlobalStyles } from "./GlobalStyles";
import CursorOverlay from "../CursorOverlay";

const CodeEditorContainer = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();    // File system state
    const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);

    // File system hook
    const {
        fileTree,
        activeFile,
        openFiles,
        expandedFolders,
        getFileContent,
        getFileObject,
        updateFileContent,
        createFile,
        createFolder,
        deleteItem,
        renameItem,
        toggleFolder,
        openFile,
        closeFile,
        setActiveFile
    } = useFileSystem(roomId, {
        // Prevent auto-switching to first file when opening files
        autoSelectFirstFile: false
    });

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
    } = useCodeEditor(roomId, activeFile, getFileContent, updateFileContent, getFileObject);

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
    } = useCursors(roomId, activeFile);

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
    }, []);    return (
        <div className="min-h-screen bg-[#09090f] text-white flex flex-col">
            <GlobalStyles />
            
            {/* Header */}            <EditorHeader
                collaborators={collaborators}
                codeBlame={codeBlame}
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
            <div className="flex flex-1">
                {/* File Explorer Sidebar */}
                <div className={`${isExplorerCollapsed ? 'w-12' : 'w-64'} flex-shrink-0 transition-all duration-200`}>
                    <FileExplorer
                        fileTree={fileTree}
                        activeFile={activeFile}
                        expandedFolders={expandedFolders}
                        onToggleFolder={toggleFolder}
                        onSelectFile={openFile}
                        onCreateFile={createFile}
                        onCreateFolder={createFolder}
                        onDeleteItem={deleteItem}
                        onRenameItem={renameItem}
                        isCollapsed={isExplorerCollapsed}
                        onToggleCollapse={() => setIsExplorerCollapsed(!isExplorerCollapsed)}
                    />
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col">
                    {/* File Tabs */}
                    <FileTabs
                        openFiles={openFiles}
                        activeFile={activeFile}
                        onSelectFile={setActiveFile}
                        onCloseFile={closeFile}
                    />

                    {/* Editor Content */}
                    <div className="flex-1 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                            {/* Left Panel - Editor and Input */}
                            <div className="flex flex-col gap-6">                                {/* Enhanced Code Editor with new features */}
                                <EnhancedCodeEditorPanel
                                    code={code}
                                    language={language}
                                    codeBlame={codeBlame}
                                    lineBlameData={lineBlameData}
                                    comments={comments}
                                    activeFile={activeFile}
                                    handleCodeChange={(value) => {
                                        handleCodeChange(value);
                                        // Trigger typing state for cursors when code changes
                                        if (editorElementRef) {
                                            const event = new CustomEvent('typing', { bubbles: true });
                                            editorElementRef.dispatchEvent(event);
                                        }
                                    }}
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>{/* Collaborative Cursors Overlay */}
            <CursorOverlay 
                userCursors={userCursors}
                editorElement={editorElementRef}
            />
        </div>
    );
};

export default CodeEditorContainer;
