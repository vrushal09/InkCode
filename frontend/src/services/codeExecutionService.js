import { LANGUAGE_CONFIGS } from '../config/jdoodle.js';

// Backend API configuration
const BACKEND_API_URL = 'http://localhost:5000/api';

// Check if backend is available
const checkBackendHealth = async () => {
    try {
        const response = await fetch(`${BACKEND_API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Execute code using backend proxy
const executeWithBackend = async (code, language, input = '') => {
    try {
        const langConfig = LANGUAGE_CONFIGS[language];
        if (!langConfig) {
            throw new Error(`Language '${language}' is not supported`);
        }

        const requestBody = {
            code: code,
            language: langConfig.jdoodleLanguage,
            versionIndex: langConfig.versionIndex,
            stdin: input || ''
        };

        const response = await fetch(`${BACKEND_API_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Handle backend response
        if (result.error) {
            return `Compilation Error: ${result.error}`;
        }

        let output = '';
        
        // Add stdout output
        if (result.output && result.output.trim()) {
            output += result.output.trim();
        }

        // Add memory and cpu time info if available
        if (result.memory || result.cpuTime) {
            output += `\n\n--- Execution Info ---`;
            if (result.memory) output += `\nMemory: ${result.memory} KB`;
            if (result.cpuTime) output += `\nCPU Time: ${result.cpuTime} seconds`;
        }

        return output || 'Code executed successfully (no output)';

    } catch (error) {
        return `Execution Error: ${error.message}`;
    }
};

// Fallback local execution for demo purposes (when JDoodle is not configured)
const executeJavaScriptLocal = (code, input) => {
    try {
        // Capture console.log output
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
            logs.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '));
        };

        // If there's input, make it available as a variable
        if (input) {
            window.userInput = input;
            code = `const input = \`${input}\`;\n${code}`;
        }

        // Execute the code
        eval(code);
        
        // Restore console.log
        console.log = originalLog;
        
        return logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)';
    } catch (error) {
        return `Error: ${error.message}`;
    }
};

export const codeExecutionService = {
    async executeCode(code, language, input = '') {
        // Simulate execution delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            // Check if backend is available
            const isBackendAvailable = await checkBackendHealth();
            
            let result = '';
            
            if (isBackendAvailable) {
                // Use backend proxy for JDoodle API
                result = await executeWithBackend(code, language, input);
            } else {
                // Fallback to local execution for JavaScript only
                if (language === 'javascript' || language === 'typescript') {
                    result = executeJavaScriptLocal(code, input);
                } else {
                    result = `⚠️ Backend server not available. Please start the backend server to execute ${language} code.\n\nRun: npm run dev in the backend directory\n\nFor now, only JavaScript can run locally in the browser.`;
                }
            }
            
            // Add input information if provided
            if (input && input.trim()) {
                result += `\n\n--- Input provided ---\n${input}`;
            }
            
            return result;
            
        } catch (error) {
            return `Execution Error: ${error.message}`;
        }
    },

    // Get supported languages
    getSupportedLanguages() {
        return Object.keys(LANGUAGE_CONFIGS);
    },

    // Get language configuration
    getLanguageConfig(language) {
        return LANGUAGE_CONFIGS[language] || null;
    },

    // Check if backend is available
    async isBackendAvailable() {
        return await checkBackendHealth();
    }
};
