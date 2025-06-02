const ControlPanel = ({ executeCode, isExecuting }) => {
    return (
        <div className="bg-[#111119] border border-gray-800 rounded-lg p-2">
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
        </div>
    );
};

export default ControlPanel;
