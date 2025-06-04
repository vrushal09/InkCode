const ControlPanel = ({ 
    executeCode, 
    isExecuting, 
    language, 
    activeFile, 
    getFileObject,
    isHTMLFile,
    canPreview,
    togglePreview,
    isPreviewOpen 
}) => {
    return (
        <div className="bg-[#111119] border border-gray-800 rounded-lg p-2 space-y-2">
            {/* Run Code Button */}
            <button
                onClick={executeCode}
                disabled={isExecuting}
                className="w-full px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded hover:from-violet-700 hover:to-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isExecuting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Running...
                    </>
                ) : (
                    <>
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run Code
                    </>
                )}
            </button>

            {/* Live Preview Button - Only show for HTML files or when preview is available */}
            {(isHTMLFile() || canPreview()) && (
                <button
                    onClick={togglePreview}
                    className={`w-full px-3 py-2 text-white rounded transition-colors text-sm flex items-center justify-center ${
                        isPreviewOpen 
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' 
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                    }`}
                    title={canPreview() ? (isPreviewOpen ? 'Close Live Preview' : 'Open Live Preview') : 'Connect files to preview'}
                >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {isPreviewOpen ? 'Close Preview' : 'Live Preview'}
                </button>
            )}

            {/* File Info */}
            {activeFile && getFileObject && (
                <div className="text-xs text-gray-400 p-2 bg-gray-800/30 rounded">
                    <div className="font-medium text-gray-300 mb-1">
                        {getFileObject(activeFile)?.name}
                    </div>
                    <div className="text-gray-500">
                        Language: {language}
                    </div>
                    {isHTMLFile() && (
                        <div className="text-blue-400 mt-1">
                            ✨ HTML file - Live preview available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ControlPanel;
