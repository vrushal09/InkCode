import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useRef, useState } from "react";
import { languageExtensions } from "../../config/languages";
import { javascript } from "@codemirror/lang-javascript";
import { createBlameTooltipExtension } from "../../extensions/blameTooltipExtension";
import { createLineBlameTooltipExtension } from "../../extensions/lineBlameTooltipExtension";
import { createCommentGutterExtension } from "../../extensions/commentGutterExtension";
import { 
    createEnhancedExtensions, 
    createSearchReplaceExtension
} from "../../extensions/editorExtensions";
import { formatCode } from "../../utils/codeFormatter";
import { openSearchPanel } from "@codemirror/search";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import { getThemeById } from '../../config/themes';

const EnhancedCodeEditorPanel = ({
    code,
    language,
    codeBlame,
    lineBlameData,
    comments,
    handleCodeChange,
    handleStartComment,
    setActiveComment,
    setEditorElement,
    activeFile
}) => {
    const { preferences } = useUserPreferences();
    const editorContainerRef = useRef(null);
    const editorViewRef = useRef(null);
    const [showMinimap, setShowMinimap] = useState(preferences.minimap);
    const [searchOpen, setSearchOpen] = useState(false);

    // Update minimap state when preferences change
    useEffect(() => {
        setShowMinimap(preferences.minimap);
    }, [preferences.minimap]);

    // Set up editor element reference for cursor tracking
    useEffect(() => {
        if (editorContainerRef.current && setEditorElement) {
            const editorElement = editorContainerRef.current.querySelector('.cm-editor');
            if (editorElement) {
                setEditorElement(editorElement);
            }
        }
    }, [setEditorElement, code]);

    // Create CodeMirror extensions
    const blameTooltipExtension = createBlameTooltipExtension(codeBlame);
    const lineBlameTooltipExtension = createLineBlameTooltipExtension(lineBlameData);
    const commentGutter = createCommentGutterExtension(
        comments,
        handleStartComment,
        setActiveComment
    );

    // Get language extension with fallback
    const getLanguageExtension = () => {
        try {
            if (languageExtensions[language] && typeof languageExtensions[language] === 'function') {
                return languageExtensions[language]();
            } else {
                console.warn('Language extension not found for:', language, 'falling back to javascript');
                return javascript();
            }
        } catch (error) {
            console.error('Error loading language extension:', error);
            return javascript();
        }
    };

    // Handle code formatting
    const handleFormatCode = async () => {
        try {
            const formatted = await formatCode(code, language);
            if (formatted !== code) {
                handleCodeChange(formatted);
            }
        } catch (error) {
            console.error('Error formatting code:', error);
        }
    };

    // Handle search toggle
    const handleToggleSearch = () => {
        if (editorViewRef.current) {
            openSearchPanel(editorViewRef.current);
            setSearchOpen(!searchOpen);
        }
    };

    // Handle editor creation
    const handleEditorMount = (editor, view) => {
        editorViewRef.current = view;
    };

    return (        <div className="h-full bg-[#111119] border border-gray-800 rounded-lg overflow-hidden relative">
            {/* Header with enhanced controls - Compact */}
            <div className="p-2 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <h3 className="text-sm font-semibold flex items-center">
                            <svg className="h-4 w-4 mr-1 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            {activeFile ? activeFile.split('/').pop() : 'Code Editor'}                            {activeFile && (
                                <span className="ml-1 text-xs text-gray-400 font-normal">
                                    ({language})
                                </span>
                            )}
                        </h3>
                        {activeFile && (
                            <p className="text-xs text-gray-500 ml-2">
                                {activeFile}
                            </p>
                        )}
                    </div>
                    
                    {/* Enhanced controls - Compact */}
                    <div className="flex items-center gap-1">
                        {/* Search & Replace Button */}
                        <button
                            onClick={handleToggleSearch}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                            title="Search & Replace (Ctrl+F)"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </button>

                        {/* Format Code Button */}
                        <button
                            onClick={handleFormatCode}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-700 hover:bg-violet-600 text-white rounded transition-colors"
                            title="Format Code (Shift+Alt+F)"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Format
                        </button>

                        {/* Minimap Toggle */}
                        <button
                            onClick={() => setShowMinimap(!showMinimap)}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                showMinimap 
                                    ? 'bg-green-700 hover:bg-green-600 text-white' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                            title="Toggle Minimap"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                            Minimap
                        </button>
                    </div>
                </div>
            </div>

            {/* Feature descriptions - Compact */}
            <div className="px-2 py-1 bg-gray-800/50 border-b border-gray-700">
                <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        Autocomplete
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        Search
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                        Format
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                        Minimap
                    </span>
                </div>
            </div>

            {/* Enhanced Editor - Flexible height */}
            <div className={`${showMinimap ? 'relative' : ''} flex-1 overflow-hidden`} ref={editorContainerRef}>
                <div className={`${showMinimap ? 'pr-32' : ''} h-full`}>                    <CodeMirror
                        value={code}
                        height="100%"
                        theme={getThemeById(preferences.theme)}
                        basicSetup={{
                            lineNumbers: preferences.lineNumbers,
                            foldGutter: true,
                            dropCursor: false,
                            allowMultipleSelections: true,
                            indentOnInput: true,
                            bracketMatching: preferences.bracketMatching,
                            closeBrackets: true,
                            autocompletion: preferences.autoCompletion,
                            highlightActiveLine: preferences.highlightActiveLine,
                            searchKeymap: true,
                            history: true
                        }}
                        extensions={[
                            getLanguageExtension(),
                            ...createEnhancedExtensions(language, preferences),
                            createSearchReplaceExtension(),
                            blameTooltipExtension,
                            lineBlameTooltipExtension,
                            commentGutter
                        ]}
                        onChange={handleCodeChange}
                        onCreateEditor={handleEditorMount}
                    />
                </div>

                {/* Minimap */}
                {showMinimap && (
                    <div className="absolute top-0 right-0 w-28 h-full bg-gray-900/90 border-l border-gray-700 overflow-hidden">
                        <div className="p-2">
                            <div className="text-xs text-gray-400 mb-2 font-semibold">Minimap</div>
                            <div className="space-y-px">
                                {code.split('\n').slice(0, 50).map((line, index) => (
                                    <div
                                        key={index}
                                        className="h-1 bg-gray-600 rounded-sm opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
                                        style={{
                                            width: `${Math.min(100, Math.max(10, line.length * 2))}%`,
                                            backgroundColor: line.trim() ? '#6b7280' : '#374151'
                                        }}
                                        title={`Line ${index + 1}: ${line.substring(0, 50)}${line.length > 50 ? '...' : ''}`}
                                        onClick={() => {
                                            if (editorViewRef.current) {
                                                const line = editorViewRef.current.state.doc.line(index + 1);
                                                editorViewRef.current.dispatch({
                                                    selection: { anchor: line.from, head: line.to },
                                                    scrollIntoView: true
                                                });
                                            }
                                        }}
                                    />
                                ))}
                                {code.split('\n').length > 50 && (
                                    <div className="text-xs text-gray-500 mt-2">
                                        +{code.split('\n').length - 50} more lines
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>            {/* Help text - Compact */}
            <div className="px-2 py-1 bg-gray-800/30 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-400">Shortcuts:</span>
                    <span className="ml-1">Ctrl+F</span>
                    <span className="ml-1">Shift+Alt+F</span>
                    <span className="ml-1">Ctrl+Space</span>
                    <span className="ml-1">Ctrl+Z/Y</span>
                </div>
            </div>
        </div>
    );
};

export default EnhancedCodeEditorPanel;
