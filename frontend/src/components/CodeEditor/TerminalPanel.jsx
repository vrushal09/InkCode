import { useState, useRef, useEffect } from 'react';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

const TerminalPanel = ({ 
    output, 
    input, 
    setInput, 
    executeCode, 
    isExecuting, 
    language,
    activeFile 
}) => {
    const { preferences } = useUserPreferences();
    const [terminalHistory, setTerminalHistory] = useState([]);
    const [currentCommand, setCurrentCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const terminalRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new output is added
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalHistory, output]);

    // Add output to terminal history when it changes
    useEffect(() => {
        if (output && output.trim()) {
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: output,
                    timestamp: new Date().toLocaleTimeString(),
                    language: language
                }
            ]);
        }
    }, [output, language]);

    const handleCommandSubmit = (e) => {
        e.preventDefault();
        
        if (!currentCommand.trim()) return;

        // Add command to history
        const command = currentCommand.trim();
        setCommandHistory(prev => [...prev, command]);
        setHistoryIndex(-1);

        // Add command to terminal display
        setTerminalHistory(prev => [
            ...prev,
            {
                type: 'command',
                content: command,
                timestamp: new Date().toLocaleTimeString(),
                language: language
            }
        ]);

        // Handle different command types
        if (command.toLowerCase() === 'run' || command.toLowerCase() === 'execute') {
            // Execute the current file
            executeCode();
        } else if (command.toLowerCase() === 'clear') {
            // Clear terminal
            setTerminalHistory([]);
        } else if (command.toLowerCase().startsWith('echo ')) {
            // Echo command
            const message = command.substring(5);
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: message,
                    timestamp: new Date().toLocaleTimeString(),
                    language: 'text'
                }
            ]);
        } else if (command.toLowerCase() === 'help') {
            // Show help
            const helpText = `Available commands:
run/execute - Run the current code file
clear - Clear terminal
echo <message> - Display message
help - Show this help
pwd - Show current file
lang - Show current language`;
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: helpText,
                    timestamp: new Date().toLocaleTimeString(),
                    language: 'text'
                }
            ]);
        } else if (command.toLowerCase() === 'pwd') {
            // Show current working directory/file
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: activeFile || 'No file selected',
                    timestamp: new Date().toLocaleTimeString(),
                    language: 'text'
                }
            ]);
        } else if (command.toLowerCase() === 'lang') {
            // Show current language
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: `Current language: ${language}`,
                    timestamp: new Date().toLocaleTimeString(),
                    language: 'text'
                }
            ]);
        } else {
            // For other commands, treat as input for code execution
            setInput(command);
            executeCode();
        }

        setCurrentCommand('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex + 1;
                if (newIndex < commandHistory.length) {
                    setHistoryIndex(newIndex);
                    setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
                }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setCurrentCommand('');
            }
        }
    };

    const getPrompt = () => {
        const fileName = activeFile ? activeFile.split('/').pop() : 'editor';
        return `${fileName}:${language}$`;
    };    const renderContent = (item) => {
        const isLightTheme = preferences.terminalTheme === 'light';
        
        if (item.type === 'command') {
            return (
                <div className="flex items-start gap-1 mb-1">
                    <span className={`${isLightTheme ? 'text-green-600' : 'text-green-400'} font-mono text-xs`}>{getPrompt()}</span>
                    <span className={`${isLightTheme ? 'text-black' : 'text-white'} font-mono text-xs`}>{item.content}</span>
                    <span className={`${isLightTheme ? 'text-gray-600' : 'text-gray-500'} text-xs ml-auto`}>{item.timestamp}</span>
                </div>
            );
        } else {
            return (
                <div className="mb-1">
                    <pre className={`${isLightTheme ? 'text-gray-800' : 'text-gray-300'} font-mono text-xs whitespace-pre-wrap break-words`}>
                        {item.content}
                    </pre>
                    <span className={`${isLightTheme ? 'text-gray-600' : 'text-gray-500'} text-xs`}>{item.timestamp}</span>
                </div>
            );
        }
    };

    return (
        <div className="h-full bg-[#111119] border border-gray-800 rounded-lg overflow-hidden flex flex-col">
            {/* Terminal Header - Compact */}
            <div className="px-3 py-2 border-b border-gray-800 bg-[#0a0f]">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center">
                        <svg className="h-4 w-4 mr-1 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Terminal
                        <span className="ml-1 text-xs text-gray-400 font-normal">
                            ({language})
                        </span>
                    </h3>
                    <div className="flex items-center gap-1">
                        {/* Run Button */}
                        <button
                            onClick={executeCode}
                            disabled={isExecuting}
                            className="flex items-center gap-1 px-2 py-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-600 text-white rounded transition-colors text-xs"
                            title="Run Code (Ctrl+Enter)"
                        >
                            {isExecuting ? (
                                <>
                                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Run
                                </>
                            ) : (
                                <>
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V8a3 3 0 01-3 3H9a3 3 0 01-3-3V4a3 3 0 013 3z" />
                                    </svg>
                                    Run
                                </>
                            )}
                        </button>
                        
                        {/* Clear Button */}
                        <button
                            onClick={() => setTerminalHistory([])}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-xs"
                            title="Clear Terminal"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear
                        </button>
                    </div>
                </div>
            </div>            {/* Terminal Content - Responsive sizing */}
            <div 
                ref={terminalRef}
                className={`flex-1 p-2 ${preferences.terminalTheme === 'light' ? 'bg-gray-100 text-black' : 'bg-black text-white'} overflow-y-auto font-mono`}
                style={{ fontSize: `${preferences.terminalFontSize}px` }}
            >                {/* Welcome message */}
                {terminalHistory.length === 0 && (
                    <div className={`${preferences.terminalTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} mb-2`}>
                        <p className="text-xs">InkCode Terminal - Ready to execute your code!</p>
                        <p className="text-xs mt-1">Type 'help' for available commands or 'run' to execute code.</p>
                    </div>
                )}

                {/* Terminal history */}
                {terminalHistory.map((item, index) => (
                    <div key={index}>
                        {renderContent(item)}
                    </div>
                ))}                {/* Current input line */}
                <form onSubmit={handleCommandSubmit} className="flex items-center gap-1 mt-1">
                    <span className={`${preferences.terminalTheme === 'light' ? 'text-green-600' : 'text-green-400'} font-mono text-xs`}>{getPrompt()}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentCommand}
                        onChange={(e) => setCurrentCommand(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`flex-1 bg-transparent ${preferences.terminalTheme === 'light' ? 'text-black' : 'text-white'} font-mono text-xs outline-none border-none`}
                        placeholder="Enter command..."
                        autoFocus
                    />
                </form>
            </div>

            {/* Terminal Footer - Compact */}
            <div className="px-2 py-1 bg-gray-800/30 border-t border-gray-700">
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <div>
                        <span className="font-medium text-gray-400">Commands:</span>
                        <span className="ml-1">run</span>
                        <span className="ml-1">clear</span>
                        <span className="ml-1">help</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-400">↑↓</span>
                        <span className="ml-1">Ctrl+Enter</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminalPanel;
