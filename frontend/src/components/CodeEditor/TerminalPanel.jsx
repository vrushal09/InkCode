import { useState, useRef, useEffect } from 'react';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { codeExecutionService } from '../../services/codeExecutionService';

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
    }, [output, language]);    const handleCommandSubmit = async (e) => {
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
            ]);        } else if (command.toLowerCase() === 'help') {
            // Show help
            const helpText = `Available commands:
run/execute - Run the current code file
clear - Clear terminal
echo <message> - Display message
help - Show this help
pwd - Show current file
lang - Show current language
status - Show execution environment status
config - Show backend configuration status
backend - Show backend server info`;
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: helpText,
                    timestamp: new Date().toLocaleTimeString(),
                    language: 'text'
                }
            ]);} else if (command.toLowerCase() === 'status') {
            // Show execution status
            const isBackendAvailable = await codeExecutionService.isBackendAvailable();
            const supportedLangs = codeExecutionService.getSupportedLanguages();
            const statusText = `Execution Environment Status:
${isBackendAvailable ? '✅ Backend Server: Running' : '⚠️ Backend Server: Not available'}
📋 Supported Languages: ${supportedLangs.join(', ')}
🔧 Current Language: ${language}
${!isBackendAvailable ? '\n⚠️ Start backend server: npm run dev (in backend directory)' : ''}`;
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: statusText,
                    timestamp: new Date().toLocaleTimeString(),
                    language: 'text'
                }
            ]);
        } else if (command.toLowerCase() === 'config') {
            // Show config status
            const isBackendAvailable = await codeExecutionService.isBackendAvailable();
            const langConfig = codeExecutionService.getLanguageConfig(language);
            const configText = `Configuration Status:
Backend Server: ${isBackendAvailable ? 'Running ✅' : 'Not available ⚠️'}
${langConfig ? `Language Config: ${langConfig.name} (${langConfig.jdoodleLanguage})` : 'Language not supported'}
${!isBackendAvailable ? '\nTo start backend:\n1. cd backend\n2. npm install\n3. npm run dev' : ''}`;
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: configText,
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
            ]);        } else if (command.toLowerCase() === 'lang') {
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
        } else if (command.toLowerCase() === 'backend') {
            // Show backend info
            const backendText = `Backend Server Information:
URL: http://localhost:5000
Health Check: http://localhost:5000/api/health
Execute Endpoint: http://localhost:5000/api/execute

To start backend server:
1. cd backend
2. npm install
3. npm run dev`;
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: backendText,
                    timestamp: new Date().toLocaleTimeString(),
                    language: 'text'
                }
            ]);
        } else {
            // Unknown command
            setTerminalHistory(prev => [
                ...prev,
                {
                    type: 'output',
                    content: `Unknown command: ${command}. Type 'help' for available commands.`,
                    timestamp: new Date().toLocaleTimeString(),
                    language: 'text'
                }
            ]);
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
        if (item.type === 'command') {
            return (
                <div className="flex items-start gap-2 mb-2">
                    <span className="text-[#FFFFFF] font-mono text-sm">{getPrompt()}</span>
                    <span className="text-[#FFFFFF] font-mono text-sm">{item.content}</span>
                    <span className="text-[#FFFFFF]/50 text-sm ml-auto">{item.timestamp}</span>
                </div>
            );
        } else {
            return (
                <div className="mb-3">
                    <pre className="text-[#FFFFFF]/90 font-mono text-sm whitespace-pre-wrap break-words">
                        {item.content}
                    </pre>
                    <span className="text-[#FFFFFF]/50 text-sm">{item.timestamp}</span>
                </div>
            );
        }
    };return (
        <div className="h-full bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden flex flex-col">
            {/* Terminal Header */}
            <div className="px-4 py-3 border-b border-[#242424] bg-[#000000]">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium flex items-center text-[#FFFFFF]">
                        <svg className="h-5 w-5 mr-2 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Terminal
                        <span className="ml-2 text-sm text-[#FFFFFF]/60 font-normal">
                            ({language})
                        </span>
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* Run Button */}
                        <button
                            onClick={executeCode}
                            disabled={isExecuting}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#FFFFFF] text-[#000000] hover:bg-[#FFFFFF]/90 disabled:bg-[#FFFFFF]/50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
                            title="Run Code (Ctrl+Enter)"
                        >
                            {isExecuting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Running...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V8a3 3 0 01-3 3H9a3 3 0 01-3-3V4a3 3 0 013 3z" />
                                    </svg>
                                    Run Code
                                </>
                            )}
                        </button>
                        
                        {/* Clear Button */}
                        <button
                            onClick={() => setTerminalHistory([])}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#242424] text-[#FFFFFF] hover:bg-[#242424]/80 rounded-lg transition-colors text-sm"
                            title="Clear Terminal"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear
                        </button>
                    </div>
                </div>
            </div>            {/* Terminal Content */}
            <div 
                ref={terminalRef}
                className="flex-1 p-4 bg-[#000000] text-[#FFFFFF] overflow-y-auto font-mono custom-scrollbar"
                style={{ fontSize: `${preferences.terminalFontSize}px` }}
            >
                {/* Welcome message */}
                {terminalHistory.length === 0 && (
                    <div className="text-[#FFFFFF]/60 mb-4">
                        <p className="text-sm">InkCode Terminal - Ready to execute your code!</p>
                        <p className="text-sm mt-2">Type 'help' for available commands or 'run' to execute code.</p>
                    </div>
                )}

                {/* Terminal history */}
                {terminalHistory.map((item, index) => (
                    <div key={index}>
                        {renderContent(item)}
                    </div>
                ))}

                {/* Current input line */}
                <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 mt-2">
                    <span className="text-[#FFFFFF] font-mono text-sm">{getPrompt()}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={currentCommand}
                        onChange={(e) => setCurrentCommand(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent text-[#FFFFFF] font-mono text-sm outline-none border-none placeholder-[#FFFFFF]/50"
                        placeholder="Enter command..."
                        autoFocus
                    />
                </form>
            </div>

            {/* Terminal Footer */}
            <div className="px-4 py-2 bg-[#0A0A0A] border-t border-[#242424]">
                <div className="flex justify-between items-center text-sm text-[#FFFFFF]/60">
                    <div className="flex items-center gap-4">
                        <span className="font-medium text-[#FFFFFF]/80">Commands:</span>
                        <span>run</span>
                        <span>clear</span>
                        <span>help</span>
                        <span>status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-[#FFFFFF]/80">↑↓ History</span>
                        <span>Ctrl+Enter Run</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminalPanel;
