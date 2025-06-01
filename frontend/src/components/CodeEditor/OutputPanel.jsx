const OutputPanel = ({ output }) => {
    return (
        <div className="flex-1 bg-[#111119] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex-shrink-0">
                <h3 className="text-lg font-semibold flex items-center">
                    <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Output
                </h3>
            </div>
            <div className="flex-1 overflow-hidden">
                <pre className="custom-scrollbar p-4 text-sm text-gray-300 whitespace-pre-wrap h-full overflow-y-auto bg-[#0a0a0f] font-mono">
                    {output || "Run your code to see the output here..."}
                </pre>
            </div>
        </div>
    );
};

export default OutputPanel;
