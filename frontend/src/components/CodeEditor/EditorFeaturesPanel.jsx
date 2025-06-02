import { useState } from 'react';

const EditorFeaturesPanel = () => {
    const [isOpen, setIsOpen] = useState(false);

    const features = [
        {
            name: "Autocomplete / IntelliSense",
            status: "✅ Implemented",
            description: "Smart code completion with JavaScript/TypeScript suggestions",
            shortcut: "Ctrl+Space",
            color: "text-green-400"
        },
        {
            name: "Code Formatting",
            status: "✅ Implemented", 
            description: "Format your code for better readability and consistency",
            shortcut: "Shift+Alt+F",
            color: "text-green-400"
        },
        {
            name: "Search & Replace",
            status: "✅ Implemented",
            description: "Find and replace text across your code with regex support",
            shortcut: "Ctrl+F / Ctrl+H",
            color: "text-green-400"
        },
        {
            name: "Minimap",
            status: "✅ Implemented",
            description: "Overview of your entire code file for quick navigation",
            shortcut: "Toggle button",
            color: "text-green-400"
        }
    ];

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-violet-700 hover:bg-violet-600 text-white rounded-lg transition-colors"
                title="View Editor Features"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Features
                <svg 
                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Features Panel */}
            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <svg className="h-5 w-5 mr-2 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Enhanced Editor Features
                        </h3>
                        
                        <div className="space-y-3">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-gray-800 rounded-lg p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-white">{feature.name}</h4>
                                        <span className={`text-sm ${feature.color} font-medium`}>
                                            {feature.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-2">{feature.description}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Shortcut:</span>
                                        <code className="text-xs bg-gray-700 px-2 py-1 rounded text-violet-300">
                                            {feature.shortcut}
                                        </code>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-violet-900/30 border border-violet-700/50 rounded-lg">
                            <h4 className="text-sm font-medium text-violet-300 mb-2">💡 Pro Tips</h4>
                            <ul className="text-xs text-gray-300 space-y-1">
                                <li>• Use Ctrl+Space while typing for smart suggestions</li>
                                <li>• Press Ctrl+F to search and Ctrl+H for find & replace</li>
                                <li>• Use the minimap to quickly navigate large files</li>
                                <li>• Format code regularly for better readability</li>
                                <li>• All features work with multiple programming languages</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorFeaturesPanel;
