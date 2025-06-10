const OutputPanel = ({ output }) => {
    // Find backend connectivity error patterns
    const isBackendError = output && 
        (output.includes('Backend server not available') || 
         output.includes('Failed to connect to backend server'));
    
    return (
        <div className="flex-1 bg-[#0A0A0A] border border-[#242424] rounded-xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[#242424] flex-shrink-0">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg className="h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Output
                </h3>
            </div>
            <div className="flex-1 overflow-hidden">
                <pre className="custom-scrollbar p-6 text-sm text-white/80 whitespace-pre-wrap h-full overflow-y-auto bg-[#000000] font-mono">
                    {output || "Run your code to see the output here..."}
                    
                    {isBackendError && (
                        <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                            <h4 className="text-yellow-400 font-medium mb-2">Backend Connection Troubleshooting:</h4>
                            <ol className="list-decimal pl-5 space-y-2 text-yellow-200">
                                <li>Check that your backend server is running on Render</li>
                                <li>Make sure the frontend is configured with the correct backend URL</li>
                                <li>Your backend URL should be: <code className="px-1 py-0.5 bg-black/30 rounded">https://inkcode-ymp9.onrender.com</code></li>
                                <li>Check the browser console for specific connection errors</li>
                                <li>Verify that CORS is properly configured on the backend to allow requests from your Vercel domain</li>
                                <li>Try running the command <code className="px-1 py-0.5 bg-black/30 rounded">status</code> in the terminal below for more information</li>
                            </ol>
                        </div>
                    )}
                </pre>
            </div>
        </div>
    );
};

export default OutputPanel;
