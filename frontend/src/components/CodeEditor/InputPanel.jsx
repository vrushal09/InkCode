const InputPanel = ({ input, setInput }) => {
    return (
        <div className="h-48 bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#242424]">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg className="h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Input
                </h3>
            </div>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-[calc(100%-5rem)] p-6 bg-[#000000] text-white resize-none focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-white/60 border border-[#242424] rounded-lg"
                placeholder="Enter input here..."
            />
        </div>
    );
};

export default InputPanel;
