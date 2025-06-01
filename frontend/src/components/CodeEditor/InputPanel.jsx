const InputPanel = ({ input, setInput }) => {
    return (
        <div className="h-48 bg-[#111119] border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold flex items-center">
                    <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Input
                </h3>
            </div>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-[calc(100%-4rem)] p-4 bg-transparent text-white resize-none focus:outline-none placeholder-gray-400"
                placeholder="Enter input here..."
            />
        </div>
    );
};

export default InputPanel;
