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
    activeFile,
    showInputPrompt,
    inputPromptMessage,
    pendingExecution,
    confirmInputAndExecute,
    dismissInputPrompt
}) => {
    const { preferences } = useUserPreferences();
    const [terminalHistory, setTerminalHistory] = useState([]);
    const [currentCommand, setCurrentCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isInputPanelCollapsed, setIsInputPanelCollapsed] = useState(!showInputPrompt);
    const terminalRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new output is added
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalHistory, output]);    // Add output to terminal history when it changes
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
    
    // Automatically expand input panel when input is required
    useEffect(() => {
        if (showInputPrompt) {
            setIsInputPanelCollapsed(false);
        }
    }, [showInputPrompt]);const handleCommandSubmit = async (e) => {
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
                <div className="flex flex-wrap items-start gap-x-2 mb-1.5 pb-1 border-b border-[#242424]/20">
                    <span className="text-[#FFFFFF] font-mono text-sm whitespace-nowrap">{getPrompt()}</span>
                    <span className="text-[#FFFFFF] font-mono text-sm flex-1">{item.content}</span>
                    <span className="text-[#FFFFFF]/40 text-xs">{item.timestamp}</span>
                </div>
            );
        } else {
            return (
                <div className="mb-2 pl-1 border-l-2 border-[#242424]/50">
                    <pre className="text-[#FFFFFF]/90 font-mono text-sm whitespace-pre-wrap break-words overflow-x-auto max-h-[500px] overflow-y-auto">
                        {item.content}
                    </pre>
                    <span className="text-[#FFFFFF]/40 text-xs block mt-1">{item.timestamp}</span>
                </div>
            );
        }
    };return (
        <div className="h-full bg-[#0A0A0A] border border-[#242424] rounded-xl overflow-hidden flex flex-col max-h-full">
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
                className="flex-1 p-3 bg-[#000000] text-[#FFFFFF] overflow-y-auto font-mono custom-scrollbar"
                style={{ fontSize: `${preferences.terminalFontSize}px` }}
            >
                {/* Welcome message */}
                {terminalHistory.length === 0 && (
                    <div className="text-[#FFFFFF]/60 mb-4">
                        <p className="text-sm">InkCode Terminal - Ready to execute your code!</p>
                        <p className="text-sm mt-2">Type 'help' for available commands or 'run' to execute code.</p>
                    </div>
                )}

                {/* Terminal history - with better spacing */}
                <div className="space-y-1">
                    {terminalHistory.map((item, index) => (
                        <div key={index}>
                            {renderContent(item)}
                        </div>
                    ))}
                </div>

                {/* Current input line - fixed styling */}
                <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 mt-3 border-t border-[#242424]/30 pt-2">
                    <span className="text-[#FFFFFF] font-mono text-sm whitespace-nowrap">{getPrompt()}</span>
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
            </div>{/* Input Section - Collapsible */}
            <div className="bg-[#0A0A0A] border-t border-[#242424] flex-shrink-0">
                {/* Input Section Header with Toggle */}
                <div 
                    className={`px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-[#1A1A1A] transition-colors ${showInputPrompt ? 'bg-yellow-900/20' : ''}`}
                    onClick={() => setIsInputPanelCollapsed(!isInputPanelCollapsed)}
                >
                    <div className="flex items-center">
                        <span className={`text-sm font-medium ${showInputPrompt ? 'text-yellow-300' : 'text-[#FFFFFF]/80'}`}>
                            Program Input
                        </span>
                        {showInputPrompt && (
                            <span className="ml-2 px-2 py-0.5 bg-yellow-600 text-xs rounded-full animate-pulse">
                                Required
                            </span>
                        )}
                        {!isInputPanelCollapsed && input.trim() && !showInputPrompt && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-500/30 text-blue-300 text-xs rounded-full">
                                Has Input
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {!isInputPanelCollapsed && showInputPrompt && (
                            <div className="flex space-x-2 mr-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmInputAndExecute();
                                    }}
                                    disabled={isExecuting || !input.trim()}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 disabled:cursor-not-allowed text-white text-xs rounded-md transition-colors whitespace-nowrap"
                                >
                                    {isExecuting ? 'Executing...' : 'Execute'}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dismissInputPrompt();
                                    }}
                                    disabled={isExecuting}
                                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white text-xs rounded-md transition-colors whitespace-nowrap"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        
                        {/* Collapse/Expand Icon */}
                        <svg 
                            className={`h-4 w-4 text-[#FFFFFF]/60 transition-transform ${isInputPanelCollapsed ? '' : 'transform rotate-180'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                  {/* Collapsible Content with smooth transition */}
                <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isInputPanelCollapsed ? 'max-h-0 opacity-0' : 'max-h-72 opacity-100'
                    }`}
                >
                    {/* Prompt Message - Only shown when input is required */}
                    {showInputPrompt && inputPromptMessage && (
                        <div className="px-4 py-2 bg-yellow-900/30 border-y border-[#242424]">
                            <div className="flex items-center">
                                <svg className="h-4 w-4 mr-2 flex-shrink-0 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-yellow-300 text-sm line-clamp-2">{inputPromptMessage}</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Input Textarea Area */}
                    <div className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-[#FFFFFF]/70">
                                Enter values for your program:
                            </label>
                            
                            {/* Input area controls */}
                            <div className="flex items-center">
                                {input.trim() && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setInput('');
                                        }}
                                        className="text-xs text-[#FFFFFF]/60 hover:text-[#FFFFFF]/90 px-2 py-0.5"
                                        title="Clear input"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={showInputPrompt ? "Please provide input values..." : "Enter input values (if needed)..."}
                            className={`w-full mt-1 p-2 bg-[#000000] border rounded-lg text-[#FFFFFF] font-mono text-sm resize-none focus:outline-none transition-colors ${
                                showInputPrompt 
                                    ? 'border-yellow-500 focus:border-yellow-400 ring-1 ring-yellow-500/20' 
                                    : 'border-[#242424] focus:border-[#FFFFFF]/30'
                            }`}
                            rows={2}
                            autoFocus={showInputPrompt}
                        />
                        {showInputPrompt && !input.trim() && (
                            <p className="text-yellow-400 text-xs mt-1">
                                Input is required to execute this code
                            </p>
                        )}
                    </div>
                </div>
            </div>            {/* Terminal Footer */}
            <div className="px-4 py-1.5 bg-[#0A0A0A] border-t border-[#242424] flex-shrink-0">
                <div className="flex flex-wrap justify-between items-center text-xs text-[#FFFFFF]/60">
                    <div className="flex items-center flex-wrap gap-2 md:gap-3">
                        <span className="font-medium text-[#FFFFFF]/80">Commands:</span>
                        <span className="px-1.5 py-0.5 bg-[#242424]/50 rounded">run</span>
                        <span className="px-1.5 py-0.5 bg-[#242424]/50 rounded">clear</span>
                        <span className="px-1.5 py-0.5 bg-[#242424]/50 rounded">help</span>
                        <span className="px-1.5 py-0.5 bg-[#242424]/50 rounded">status</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 md:mt-0">
                        <button
                            onClick={() => setIsInputPanelCollapsed(!isInputPanelCollapsed)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                                showInputPrompt ? 'bg-yellow-900/30 text-yellow-300' : 
                                (input.trim() ? 'bg-blue-900/30 text-blue-300' : 'hover:bg-[#242424]/50')
                            }`}
                            title="Toggle input panel"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span className="ml-1">Input</span>
                            {showInputPrompt && (
                                <span className="h-2 w-2 rounded-full bg-yellow-400 ml-1"></span>
                            )}
                        </button>
                        <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                            <span className="ml-1 text-[#FFFFFF]/70">History</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 bg-[#242424] rounded text-xs">Ctrl+Enter</kbd>
                            <span className="text-[#FFFFFF]/70">Run</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminalPanel;
