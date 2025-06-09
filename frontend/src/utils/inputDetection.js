// Input detection patterns for different programming languages
const INPUT_PATTERNS = {
    javascript: [
        /prompt\s*\(/i,
        /readline\s*\(/i,
        /process\.stdin/i,
        /readlineSync/i,
        /input\s*\(/i
    ],
    typescript: [
        /prompt\s*\(/i,
        /readline\s*\(/i,
        /process\.stdin/i,
        /readlineSync/i,
        /input\s*\(/i
    ],
    python: [
        /input\s*\(/i,
        /raw_input\s*\(/i,
        /sys\.stdin\.read/i,
        /sys\.stdin\.readline/i
    ],
    java: [
        /Scanner\s*\(/i,
        /\.next\(\)/i,
        /\.nextLine\(\)/i,
        /\.nextInt\(\)/i,
        /\.nextDouble\(\)/i,
        /\.nextFloat\(\)/i,
        /\.nextBoolean\(\)/i,
        /System\.in/i,
        /BufferedReader/i,
        /InputStreamReader/i
    ],
    cpp: [
        /cin\s*>>/i,
        /scanf\s*\(/i,
        /getline\s*\(/i,
        /gets\s*\(/i,
        /getchar\s*\(/i
    ],
    c: [
        /scanf\s*\(/i,
        /gets\s*\(/i,
        /getchar\s*\(/i,
        /fgets\s*\(/i,
        /getline\s*\(/i
    ]
};

// Messages to show users for different languages
const INPUT_MESSAGES = {
    javascript: "Your JavaScript code contains input statements (prompt, readline, etc.). Please provide input values:",
    typescript: "Your TypeScript code contains input statements (prompt, readline, etc.). Please provide input values:",
    python: "Your Python code contains input() statements. Please provide input values (one per line):",
    java: "Your Java code contains input statements (Scanner, System.in, etc.). Please provide input values:",
    cpp: "Your C++ code contains input statements (cin, scanf, etc.). Please provide input values:",
    c: "Your C code contains input statements (scanf, gets, etc.). Please provide input values:"
};

/**
 * Detects if code contains input statements
 * @param {string} code - The source code to analyze
 * @param {string} language - The programming language
 * @returns {boolean} - True if input is detected, false otherwise
 */
export const detectInputInCode = (code, language) => {
    if (!code || !language) return false;
    
    const patterns = INPUT_PATTERNS[language.toLowerCase()];
    if (!patterns) return false;
    
    // Remove comments and strings to avoid false positives
    const cleanCode = removeCommentsAndStrings(code, language);
    
    return patterns.some(pattern => pattern.test(cleanCode));
};

/**
 * Gets the input message for a specific language
 * @param {string} language - The programming language
 * @returns {string} - The input message to show to the user
 */
export const getInputMessage = (language) => {
    return INPUT_MESSAGES[language.toLowerCase()] || "Your code contains input statements. Please provide input values:";
};

/**
 * Removes comments and string literals to avoid false positive input detection
 * @param {string} code - The source code
 * @param {string} language - The programming language
 * @returns {string} - Code with comments and strings removed
 */
const removeCommentsAndStrings = (code, language) => {
    let cleanCode = code;
    
    switch (language.toLowerCase()) {
        case 'javascript':
        case 'typescript':
        case 'java':
        case 'cpp':
        case 'c':
            // Remove single-line comments
            cleanCode = cleanCode.replace(/\/\/.*$/gm, '');
            // Remove multi-line comments
            cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, '');
            // Remove string literals (basic removal - doesn't handle all edge cases)
            cleanCode = cleanCode.replace(/"(?:[^"\\]|\\.)*"/g, '""');
            cleanCode = cleanCode.replace(/'(?:[^'\\]|\\.)*'/g, "''");
            break;
            
        case 'python':
            // Remove single-line comments
            cleanCode = cleanCode.replace(/#.*$/gm, '');
            // Remove triple-quoted strings
            cleanCode = cleanCode.replace(/"""[\s\S]*?"""/g, '""""""');
            cleanCode = cleanCode.replace(/'''[\s\S]*?'''/g, "''''''");
            // Remove string literals
            cleanCode = cleanCode.replace(/"(?:[^"\\]|\\.)*"/g, '""');
            cleanCode = cleanCode.replace(/'(?:[^'\\]|\\.)*'/g, "''");
            break;
    }
    
    return cleanCode;
};

/**
 * Analyzes code and provides input requirements
 * @param {string} code - The source code to analyze
 * @param {string} language - The programming language
 * @returns {object} - Analysis result with hasInput flag and message
 */
export const analyzeCodeInput = (code, language) => {
    const hasInput = detectInputInCode(code, language);
    const message = hasInput ? getInputMessage(language) : null;
    
    return {
        hasInput,
        message,
        language
    };
};
