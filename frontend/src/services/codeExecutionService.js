import { LANGUAGE_CONFIGS } from '../config/jdoodle.js';
import API, { apiRequest } from './apiConfig.js';

// Check if backend is available
const checkBackendHealth = async () => {
    try {
        console.log(`Checking backend health at: ${API.baseURL}${API.endpoints.health}`);
        const response = await apiRequest(API.endpoints.health, {
            method: 'GET'
        });
        console.log(`Backend health check status: ${response.ok ? 'OK' : 'Failed'} (${response.status})`);
        if (response.ok) {
            const data = await response.json().catch(() => ({}));
            console.log('Backend health data:', data);
        }
        return response.ok;
    } catch (error) {
        console.error("Backend health check failed:", error);
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
        };        const response = await apiRequest(API.endpoints.execute, {
            method: 'POST',
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
            console.log(`Executing ${language} code...`);

            if (!code.trim()) {
                return 'No code to execute';
            }
            
            // Check if backend is available
            const isBackendAvailable = await checkBackendHealth();
            console.log(`Backend available: ${isBackendAvailable ? 'Yes' : 'No'}, Language: ${language}`);
            
            let result = '';
            
            if (isBackendAvailable) {
                try {
                    // Use backend proxy for JDoodle API
                    result = await executeWithBackend(code, language, input);
                } catch (connectionError) {
                    console.error('Backend execution error:', connectionError);
                    
                    // Provide detailed information about the connection issue
                    if (connectionError.message.includes('Network') || connectionError.message.includes('Failed to fetch')) {
                        result = `⚠️ Backend server not reachable. Connection failed.\n\n` + 
                                `Error Details: ${connectionError.message}\n\n` +
                                `Backend URL: ${API.baseURL}\n\n` + 
                                `Potential issues:\n` +
                                `1. Your backend server on Render might be inactive/sleeping\n` +
                                `2. CORS configuration may not include your Vercel domain: ${window.location.origin}\n` +
                                `3. Network connectivity issues\n\n` +
                                `Solutions:\n` +
                                `- Visit your Render dashboard to check if the service is running\n` +
                                `- Add "${window.location.origin}" to CORS allowed origins\n` +
                                `- Type 'debug' in the terminal to open the connection debugger\n\n` +
                                `For now, only JavaScript can run locally in the browser.`;
                    } else {
                        result = `⚠️ Backend execution error: ${connectionError.message}\n\n` +
                                 `Try running the 'debug' command in terminal for more details.`;
                    }
                }
            } else {
                // Fallback to local execution for JavaScript only
                if (language === 'javascript' || language === 'typescript') {
                    result = executeJavaScriptLocal(code, input);
                } else {
                    result = `⚠️ Backend server not available. Please start the backend server to execute ${language} code.\n\n` +
                             `Backend URL: ${API.baseURL}\n\n` +
                             `Run: npm run dev in the backend directory\n\n` +
                             `For more detailed diagnostics, type 'debug' in the terminal below.\n\n` +
                             `For now, only JavaScript can run locally in the browser.`;
                }
            }
            
            // Add input information if provided
            if (input && input.trim()) {
                result += `\n\n--- Input provided ---\n${input}`;
            }
            
            return result;
            
        } catch (error) {
            console.error('Code execution wrapper error:', error);
            return `Execution Error: ${error.message}\n\nTry running the 'debug' command in terminal for more details.`;
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
