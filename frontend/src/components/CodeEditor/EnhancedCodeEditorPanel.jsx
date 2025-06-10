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
import { getThemeById, getThemesByCategory } from '../../config/themes';

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
    activeFile,
    isHTMLFile,
    canPreview,
    togglePreview,
    isPreviewOpen
}) => {
    const { preferences, updatePreference } = useUserPreferences();
    const editorContainerRef = useRef(null);
    const editorViewRef = useRef(null);
    const [showMinimap, setShowMinimap] = useState(preferences.minimap);
    const [showSettings, setShowSettings] = useState(false);
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
    };    return (
        <div className="h-full bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden relative">
            {/* Header with enhanced controls - Compact */}
            <div className="p-3 border-b border-[#242424]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <h3 className="text-sm font-semibold flex items-center text-[#FFFFFF]">
                            <svg className="h-4 w-4 mr-2 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            {activeFile ? activeFile.split('/').pop() : 'Code Editor'}
                            {activeFile && (
                                <span className="ml-2 text-xs text-[#FFFFFF]/60 font-normal">
                                    ({language})
                                </span>
                            )}
                        </h3>
                        {activeFile && (
                            <p className="text-xs text-[#FFFFFF]/60 ml-3">
                                {activeFile}
                            </p>
                        )}
                    </div>                      {/* Enhanced controls - Compact */}
                    <div className="flex items-center gap-2">
                        {/* Live Preview Button - Show for HTML files */}
                        {(isHTMLFile && isHTMLFile()) && (
                            <button
                                onClick={togglePreview}
                                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                    isPreviewOpen 
                                        ? 'bg-[#242424] hover:bg-[#242424]/80 text-[#FFFFFF]' 
                                        : 'bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90'
                                }`}
                                title={isPreviewOpen ? 'Close Live Preview' : 'Open Live Preview'}
                            >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {isPreviewOpen ? 'Close' : 'Preview'}
                            </button>
                        )}

                        {/* Search & Replace Button */}
                        <button
                            onClick={handleToggleSearch}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#242424] hover:bg-[#242424]/80 text-[#FFFFFF] rounded-lg transition-colors"
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
                            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 rounded-lg transition-colors"
                            title="Format Code (Shift+Alt+F)"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Format
                        </button>                        {/* Minimap Toggle */}
                        <button
                            onClick={() => setShowMinimap(!showMinimap)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                showMinimap 
                                    ? 'bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90' 
                                    : 'bg-[#242424] hover:bg-[#242424]/80 text-[#FFFFFF]'
                            }`}
                            title="Toggle Minimap"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                            Minimap
                        </button>
                        
                        {/* Settings Button */}
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                showSettings 
                                    ? 'bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90' 
                                    : 'bg-[#242424] hover:bg-[#242424]/80 text-[#FFFFFF]'
                            }`}
                            title="Editor Settings"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </button>
                    </div>
                </div>
            </div>            {/* Feature descriptions - Compact */}
            <div className="px-3 py-2 bg-[#000000] border-b border-[#242424]">
                <div className="flex flex-wrap gap-3 text-xs text-[#FFFFFF]/60">
                    <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[#FFFFFF] rounded-full"></div>
                        Autocomplete
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[#FFFFFF] rounded-full"></div>
                        Search
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[#FFFFFF] rounded-full"></div>
                        Format
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[#FFFFFF] rounded-full"></div>
                        Minimap
                    </span>
                </div>
            </div>
            
            {/* Settings Panel */}
            {showSettings && (
                <div className="px-4 py-4 bg-[#0A0A0A] border-b border-[#242424]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                        {/* Theme Selector */}
                        <div>
                            <label className="block text-xs font-medium text-white/80 mb-1.5">
                                Theme
                            </label>
                            <select
                                value={preferences.theme}
                                onChange={(e) => updatePreference('theme', e.target.value)}
                                className="block w-full px-2.5 py-1.5 bg-[#000000] text-white text-xs border border-[#242424] rounded-md focus:outline-none focus:ring-1 focus:ring-white/20"
                            >
                                {Object.entries(getThemesByCategory()).map(([category, themes]) => (
                                    <optgroup key={category} label={category}>
                                        {themes.map(theme => (
                                            <option key={theme.id} value={theme.id}>
                                                {theme.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        
                        {/* Font Size */}
                        <div>
                            <label className="block text-xs font-medium text-white/80 mb-1.5">
                                Font Size
                            </label>
                            <select
                                value={preferences.fontSize}
                                onChange={(e) => updatePreference('fontSize', parseInt(e.target.value))}
                                className="block w-full px-2.5 py-1.5 bg-[#000000] text-white text-xs border border-[#242424] rounded-md focus:outline-none focus:ring-1 focus:ring-white/20"
                            >
                                <option value="10">10px</option>
                                <option value="12">12px</option>
                                <option value="14">14px</option>
                                <option value="16">16px</option>
                                <option value="18">18px</option>
                                <option value="20">20px</option>
                            </select>
                        </div>
                        
                        {/* Quick Toggle Settings */}
                        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            <label className="flex items-center space-x-2 text-xs text-white/80 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.wordWrap}
                                    onChange={(e) => updatePreference('wordWrap', e.target.checked)}
                                    className="w-3.5 h-3.5 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                />
                                <span>Word Wrap</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 text-xs text-white/80 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.lineNumbers}
                                    onChange={(e) => updatePreference('lineNumbers', e.target.checked)}
                                    className="w-3.5 h-3.5 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                />
                                <span>Line Numbers</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 text-xs text-white/80 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.autoCompletion}
                                    onChange={(e) => updatePreference('autoCompletion', e.target.checked)}
                                    className="w-3.5 h-3.5 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                />
                                <span>Auto Completion</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 text-xs text-white/80 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.bracketMatching}
                                    onChange={(e) => updatePreference('bracketMatching', e.target.checked)}
                                    className="w-3.5 h-3.5 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                />
                                <span>Bracket Matching</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 text-xs text-white/80 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.highlightActiveLine}
                                    onChange={(e) => updatePreference('highlightActiveLine', e.target.checked)}
                                    className="w-3.5 h-3.5 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                />
                                <span>Highlight Active Line</span>
                            </label>
                            
                            <label className="flex items-center space-x-2 text-xs text-white/80 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.indentWithTabs}
                                    onChange={(e) => updatePreference('indentWithTabs', e.target.checked)}
                                    className="w-3.5 h-3.5 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                />
                                <span>Indent with Tabs</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}            {/* Add CSS Animation */}
            <style jsx="true">{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
            
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
                </div>                {/* Minimap */}
                {showMinimap && (
                    <div className="absolute top-0 right-0 w-28 h-full bg-[#000000]/90 border-l border-[#242424] overflow-hidden">
                        <div className="p-2">
                            <div className="text-xs text-[#FFFFFF]/80 mb-2 font-semibold">Minimap</div>
                            <div className="space-y-px">
                                {code.split('\n').slice(0, 50).map((line, index) => (
                                    <div
                                        key={index}
                                        className="h-1 bg-[#242424] rounded-sm opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
                                        style={{
                                            width: `${Math.min(100, Math.max(10, line.length * 2))}%`,
                                            backgroundColor: line.trim() ? '#FFFFFF' : '#242424'
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
                                    <div className="text-xs text-[#FFFFFF]/60 mt-2">
                                        +{code.split('\n').length - 50} more lines
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>            {/* Help text - Compact */}
            <div className="px-3 py-2 bg-[#000000] border-t border-[#242424]">
                <div className="text-xs text-[#FFFFFF]/60">
                    <span className="font-medium text-[#FFFFFF]/80">Shortcuts:</span>
                    <span className="ml-2">Ctrl+F</span>
                    <span className="ml-2">Shift+Alt+F</span>
                    <span className="ml-2">Ctrl+Space</span>
                    <span className="ml-2">Ctrl+Z/Y</span>
                </div>
            </div>
        </div>
    );
};

export default EnhancedCodeEditorPanel;
