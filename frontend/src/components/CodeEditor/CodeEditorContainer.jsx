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
import TerminalPanel from "./TerminalPanel";
import ControlPanel from "./ControlPanel";
import CommentsSystem from "./CommentsSystem";
import FileExplorer from "../FileExplorer";
import FileTabs from "../FileTabs";
import LivePreviewPanel from "./LivePreviewPanel";
import AIAssistantPanel from "./AIAssistantPanel";

// Import hooks and utils
import { useCodeEditor } from "../../hooks/useCodeEditor";
import { useCollaboration } from "../../hooks/useCollaboration";
import { useChat } from "../../hooks/useChat";
import { useComments } from "../../hooks/useComments";
import { useCursors } from "../../hooks/useCursors";
import { useFileSystem } from "../../hooks/useFileSystem";
import { useLivePreview } from "../../hooks/useLivePreview";
import { codeExecutionService } from "../../services/codeExecutionService";
import { GlobalStyles } from "./GlobalStyles";
import CursorOverlay from "../CursorOverlay";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const CodeEditorContainer = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const { preferences } = useUserPreferences();

    // File system state - Initialize from preferences
    const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(preferences.sidebarCollapsed);

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
    } = useCursors(roomId, activeFile);    // Live preview hook
    const {
        isPreviewOpen,
        connectedFiles,
        previewContent,
        connectFile,
        disconnectFile,
        togglePreview,
        canPreview,
        isHTMLFile,
        autoDetectConnectedFiles
    } = useLivePreview(openFiles, getFileContent, getFileObject, activeFile);

    // AI Assistant state
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

    const toggleAIAssistant = () => {
        setIsAIAssistantOpen(!isAIAssistantOpen);
    };

    const handleAICodeUpdate = (newCode) => {
        if (activeFile && newCode) {
            updateFileContent(activeFile, newCode);
            setCode(newCode);
            toast.success('Code updated by AI Assistant');
        }
    };

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
        <div className="min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col">
            <GlobalStyles />
            
            {/* Top Bar - Matching Dashboard style */}
            <div className="bg-[#000000] border-b border-[#242424] p-4">
                <div className="flex items-center justify-between">
                    {/* Left: Project Info */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#FFFFFF] rounded-lg flex items-center justify-center">
                                <span className="text-[#000000] font-bold text-sm">IC</span>
                            </div>
                            <div>
                                <h1 className="text-base font-semibold text-[#FFFFFF]">Code Editor</h1>
                                <p className="text-xs text-[#FFFFFF]/60">
                                    {activeFile ? activeFile.split('/').pop() : 'No file selected'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Center: Collaborators */}
                    <div className="flex items-center space-x-2">
                        {collaborators.map((user) => (
                            <div
                                key={user.id}
                                className="relative group"
                                title={`${user.name}\nLast active: ${new Date(user.lastActive).toLocaleString()}`}
                            >
                                <img
                                    src={user.photoURL}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full border-2 border-[#242424] group-hover:border-[#FFFFFF]/30 transition-colors"
                                />
                                {user.isCreator && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 border-2 border-[#000000] rounded-full"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2">
                        {/* Chat Toggle */}
                        <button
                            onClick={toggleChat}
                            className="relative p-2 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-lg transition-colors"
                            title="Toggle Chat"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.515l-5.637 2.01a1 1 0 01-1.346-1.346l2.01-5.637A8.13 8.13 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* AI Assistant Toggle */}
                        <button
                            onClick={toggleAIAssistant}
                            className="p-2 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-lg transition-colors"
                            title="AI Assistant"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </button>

                        {/* Explorer Toggle */}
                        <button
                            onClick={() => setIsExplorerCollapsed(!isExplorerCollapsed)}
                            className="p-2 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#242424] rounded-lg transition-colors"
                            title="Toggle Explorer"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

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
            <div className="flex flex-1 overflow-hidden">
                {/* File Explorer Sidebar */}
                <div className={`${isExplorerCollapsed ? 'w-0' : 'w-64'} flex-shrink-0 transition-all duration-200 bg-[#0A0A0A] border-r border-[#242424]`}>
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
                <div className="flex-1 flex flex-col bg-[#000000]">
                    {/* File Tabs */}
                    <FileTabs
                        openFiles={openFiles}
                        activeFile={activeFile}
                        onSelectFile={setActiveFile}
                        onCloseFile={closeFile}
                    />

                    {/* Editor Content */}
                    <div className="flex-1 p-4">
                        <div className="h-full flex gap-4">
                            {/* Left Panel - Main Editor */}
                            <div className="flex-1 flex flex-col gap-4">
                                {/* Enhanced Code Editor */}
                                <div className="flex-1 bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden">
                                    <EnhancedCodeEditorPanel
                                        code={code}
                                        language={language}
                                        codeBlame={codeBlame}
                                        lineBlameData={lineBlameData}
                                        comments={comments}
                                        activeFile={activeFile}
                                        handleCodeChange={(value) => {
                                            handleCodeChange(value);
                                            if (editorElementRef) {
                                                const event = new CustomEvent('typing', { bubbles: true });
                                                editorElementRef.dispatchEvent(event);
                                            }
                                        }}
                                        handleStartComment={handleStartComment}
                                        setActiveComment={setActiveComment}
                                        setEditorElement={setEditorElementRef}
                                        isHTMLFile={isHTMLFile}
                                        canPreview={canPreview}
                                        togglePreview={togglePreview}
                                        isPreviewOpen={isPreviewOpen}
                                    />
                                </div>

                                {/* Bottom Row - Terminal and Comments */}
                                <div className="h-64 flex gap-4">
                                    {/* Terminal Panel */}
                                    <div className="flex-1 bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden">
                                        <TerminalPanel
                                            output={output}
                                            input={input}
                                            setInput={setInput}
                                            executeCode={executeCode}
                                            isExecuting={isExecuting}
                                            language={language}
                                            activeFile={activeFile}
                                        />
                                    </div>

                                    {/* Comments System */}
                                    <div className="w-80 bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden">
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
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - Controls */}
                            <div className="w-72 bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden">
                                <ControlPanel
                                    executeCode={executeCode}
                                    isExecuting={isExecuting}
                                    language={language}
                                    activeFile={activeFile}
                                    getFileObject={getFileObject}
                                    isHTMLFile={isHTMLFile}
                                    canPreview={canPreview}
                                    togglePreview={togglePreview}
                                    isPreviewOpen={isPreviewOpen}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collaborative Cursors Overlay */}
            <CursorOverlay 
                userCursors={userCursors}
                editorElement={editorElementRef}
            />

            {/* Live Preview Panel */}
            <LivePreviewPanel
                isOpen={isPreviewOpen}
                previewContent={previewContent}
                connectedFiles={connectedFiles}
                openFiles={openFiles}
                getFileObject={getFileObject}
                connectFile={connectFile}
                disconnectFile={disconnectFile}
                onClose={() => togglePreview()}
            />

            {/* AI Assistant Panel */}
            <AIAssistantPanel
                isOpen={isAIAssistantOpen}
                onClose={toggleAIAssistant}
                currentCode={code}
                currentLanguage={language}
                onCodeUpdate={handleAICodeUpdate}
            />
        </div>
    );
};

export default CodeEditorContainer;
