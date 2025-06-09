const InputPanel = ({ 
    input, 
    setInput, 
    showInputPrompt, 
    inputPromptMessage, 
    onConfirmInput, 
    onDismissPrompt,
    isExecuting 
}) => {
    return (
        <div className="h-48 bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#242424] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg className="h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Input
                    {showInputPrompt && (
                        <span className="ml-2 px-2 py-1 bg-yellow-600 text-xs rounded-full animate-pulse">
                            Required
                        </span>
                    )}
                </h3>
                
                {showInputPrompt && (
                    <div className="flex space-x-2">
                        <button
                            onClick={onConfirmInput}
                            disabled={isExecuting}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-sm rounded-md transition-colors"
                        >
                            {isExecuting ? 'Executing...' : 'Execute'}
                        </button>
                        <button
                            onClick={onDismissPrompt}
                            disabled={isExecuting}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white text-sm rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
            
            {showInputPrompt && inputPromptMessage && (
                <div className="px-6 py-3 bg-yellow-900/30 border-b border-[#242424]">
                    <p className="text-yellow-300 text-sm">
                        {inputPromptMessage}
                    </p>
                </div>
            )}
            
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`w-full p-6 bg-[#000000] text-white resize-none focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-white/60 border border-[#242424] rounded-lg transition-all ${
                    showInputPrompt 
                        ? 'h-[calc(100%-8rem)] ring-2 ring-yellow-500/50' 
                        : 'h-[calc(100%-5rem)]'
                }`}
                placeholder={showInputPrompt 
                    ? "Enter your input values here (one per line for multiple inputs)..." 
                    : "Enter input here..."
                }
                autoFocus={showInputPrompt}
            />
        </div>
    );
};

export default InputPanel;
