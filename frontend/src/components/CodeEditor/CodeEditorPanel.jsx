import CodeMirror from "@uiw/react-codemirror";
import { useState, useEffect, useRef } from "react";
import { languageExtensions } from "../../config/languages";
import { javascript } from "@codemirror/lang-javascript";
import { createBlameTooltipExtension } from "../../extensions/blameTooltipExtension";
import { createLineBlameTooltipExtension } from "../../extensions/lineBlameTooltipExtension";
import { createCommentGutterExtension } from "../../extensions/commentGutterExtension";
import { createEnhancedExtensions } from "../../extensions/editorExtensions";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import { getThemeById, getThemesByCategory } from '../../config/themes';

const CodeEditorPanel = ({
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
    const { preferences, updatePreference } = useUserPreferences();
    const [showSettings, setShowSettings] = useState(false);
    const editorContainerRef = useRef(null);// Set up editor element reference for cursor tracking
    useEffect(() => {
        if (editorContainerRef.current && setEditorElement) {
            const editorElement = editorContainerRef.current.querySelector('.cm-editor');
            if (editorElement) {
                setEditorElement(editorElement);
            }
        }
    }, [setEditorElement, code]); // Re-run when code changes to ensure element is found    // Create CodeMirror extensions
    const blameTooltipExtension = createBlameTooltipExtension(codeBlame);
    const lineBlameTooltipExtension = createLineBlameTooltipExtension(lineBlameData);
    const commentGutter = createCommentGutterExtension(
        comments,
        handleStartComment,
        setActiveComment
    );

    // Debug logging to identify the issue
    console.log('CodeEditorPanel - language:', language);
    console.log('CodeEditorPanel - languageExtensions[language]:', languageExtensions[language]);
    console.log('CodeEditorPanel - typeof languageExtensions[language]:', typeof languageExtensions[language]);    return (
        <div className="flex-1 bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden relative">
            <div className="p-6 border-b border-[#242424]">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <svg className="h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        {activeFile ? activeFile.split('/').pop() : 'Code Editor'}
                        {activeFile && (
                            <span className="ml-2 text-sm text-white/60 font-normal">
                                ({language})
                            </span>
                        )}
                    </h3>
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 text-white/70 hover:text-white hover:bg-[#242424] rounded-md transition-colors"
                        title="Editor Settings"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                {activeFile && (
                    <p className="text-sm text-white/60 mt-2">
                        {activeFile}
                    </p>
                )}
                
                {/* Settings Panel */}
                {showSettings && (
                    <div className="mt-4 pt-4 border-t border-[#242424] animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Theme Selector */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Theme
                                </label>
                                <select
                                    value={preferences.theme}
                                    onChange={(e) => updatePreference('theme', e.target.value)}
                                    className="block w-full px-3 py-2 bg-[#000000] text-white border border-[#242424] rounded-md focus:outline-none focus:ring-1 focus:ring-white/20"
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
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Font Size
                                </label>
                                <select
                                    value={preferences.fontSize}
                                    onChange={(e) => updatePreference('fontSize', parseInt(e.target.value))}
                                    className="block w-full px-3 py-2 bg-[#000000] text-white border border-[#242424] rounded-md focus:outline-none focus:ring-1 focus:ring-white/20"
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
                                <label className="flex items-center space-x-2 text-sm text-white/80 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.wordWrap}
                                        onChange={(e) => updatePreference('wordWrap', e.target.checked)}
                                        className="w-4 h-4 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                    />
                                    <span>Word Wrap</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 text-sm text-white/80 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.lineNumbers}
                                        onChange={(e) => updatePreference('lineNumbers', e.target.checked)}
                                        className="w-4 h-4 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                    />
                                    <span>Line Numbers</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 text-sm text-white/80 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.autoCompletion}
                                        onChange={(e) => updatePreference('autoCompletion', e.target.checked)}
                                        className="w-4 h-4 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                    />
                                    <span>Auto Completion</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 text-sm text-white/80 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.bracketMatching}
                                        onChange={(e) => updatePreference('bracketMatching', e.target.checked)}
                                        className="w-4 h-4 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                    />
                                    <span>Bracket Matching</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 text-sm text-white/80 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.highlightActiveLine}
                                        onChange={(e) => updatePreference('highlightActiveLine', e.target.checked)}
                                        className="w-4 h-4 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                    />
                                    <span>Highlight Active Line</span>
                                </label>
                                
                                <label className="flex items-center space-x-2 text-sm text-white/80 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.indentWithTabs}
                                        onChange={(e) => updatePreference('indentWithTabs', e.target.checked)}
                                        className="w-4 h-4 bg-[#000000] border-[#242424] rounded focus:ring-1 focus:ring-white/20"
                                    />
                                    <span>Indent with Tabs</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>            <style jsx="true">{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
            `}</style>
            
            <div className="h-[400px] overflow-y-auto bg-[#000000]" ref={editorContainerRef}>                <CodeMirror
                    value={code}
                    height="100%"
                    theme={getThemeById(preferences.theme)}
                    style={{ 
                        fontSize: `${preferences.fontSize}px`,
                        fontFamily: preferences.fontFamily
                    }}
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
                        lineWrapping: preferences.wordWrap,
                        tabSize: preferences.tabSize,
                        indentWithTabs: preferences.indentWithTabs,
                        searchKeymap: true,
                        history: true
                    }}
                    extensions={[
                        (() => {
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
                        })(),
                        ...createEnhancedExtensions(language, preferences),
                        blameTooltipExtension,
                        lineBlameTooltipExtension,
                        commentGutter
                    ]}
                    onChange={handleCodeChange}
                />
            </div>
        </div>
    );
};

export default CodeEditorPanel;
