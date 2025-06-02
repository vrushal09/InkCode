// Enhanced code formatter with support for multiple languages
// Simple client-side formatting without external dependencies

// Language-specific formatters
const formatters = {
    javascript: (code) => {
        return basicJSFormat(code);
    },

    typescript: (code) => {
        return basicJSFormat(code);
    },

    html: (code) => {
        return basicHTMLFormat(code);
    },

    css: (code) => {
        return basicCSSFormat(code);
    },

    json: (code) => {
        try {
            const parsed = JSON.parse(code);
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            console.warn('JSON formatting failed:', error);
            return code;
        }
    },

    python: (code) => {
        return basicPythonFormat(code);
    },

    java: (code) => {
        return basicJavaFormat(code);
    },

    cpp: (code) => {
        return basicCppFormat(code);
    },

    c: (code) => {
        return basicCppFormat(code);
    },

    xml: (code) => {
        return basicXMLFormat(code);
    },

    sql: (code) => {
        return basicSQLFormat(code);
    }
};

// Basic formatters for languages not supported by Prettier
function basicJSFormat(code) {
    return code
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/\{(\s*)/g, ' {\n  ')
        .replace(/\}(\s*)/g, '\n}\n')
        .replace(/;(\s*)/g, ';\n')
        .replace(/,(\s*)/g, ',\n  ')
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive blank lines
        .split('\n')
        .map(line => {
            const indent = (line.match(/^\s*/) || [''])[0].length;
            return '  '.repeat(Math.floor(indent / 2)) + line.trim();
        })
        .join('\n');
}

function basicHTMLFormat(code) {
    let formatted = code.replace(/></g, '>\n<');
    let lines = formatted.split('\n');
    let indentLevel = 0;
    
    return lines.map(line => {
        line = line.trim();
        if (line.startsWith('</')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const result = '  '.repeat(indentLevel) + line;
        
        if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
            indentLevel++;
        }
        
        return result;
    }).join('\n');
}

function basicCSSFormat(code) {
    return code
        .replace(/\{/g, ' {\n  ')
        .replace(/\}/g, '\n}\n')
        .replace(/;/g, ';\n  ')
        .replace(/,/g, ',\n')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .replace(/\n  \n/g, '\n');
}

function basicPythonFormat(code) {
    return code
        .split('\n')
        .map(line => {
            // Basic Python indentation (4 spaces)
            const trimmed = line.trim();
            if (trimmed.endsWith(':')) {
                return line;
            }
            return line;
        })
        .join('\n');
}

function basicJavaFormat(code) {
    return code
        .replace(/\{/g, ' {\n    ')
        .replace(/\}/g, '\n}\n')
        .replace(/;/g, ';\n')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
}

function basicCppFormat(code) {
    return code
        .replace(/\{/g, ' {\n    ')
        .replace(/\}/g, '\n}\n')
        .replace(/;/g, ';\n')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
}

function basicXMLFormat(code) {
    let formatted = code.replace(/></g, '>\n<');
    let lines = formatted.split('\n');
    let indentLevel = 0;
    
    return lines.map(line => {
        line = line.trim();
        if (line.startsWith('</')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const result = '  '.repeat(indentLevel) + line;
        
        if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>') && !line.includes('</')) {
            indentLevel++;
        }
        
        return result;
    }).join('\n');
}

function basicSQLFormat(code) {
    return code
        .replace(/\bSELECT\b/gi, '\nSELECT')
        .replace(/\bFROM\b/gi, '\nFROM')
        .replace(/\bWHERE\b/gi, '\nWHERE')
        .replace(/\bJOIN\b/gi, '\nJOIN')
        .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
        .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
        .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
        .replace(/\bORDER BY\b/gi, '\nORDER BY')
        .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
        .replace(/\bHAVING\b/gi, '\nHAVING')
        .replace(/\bLIMIT\b/gi, '\nLIMIT')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
}

// Main format function
export const formatCode = async (code, language) => {
    if (!code || !code.trim()) {
        return code;
    }

    try {
        const formatter = formatters[language] || formatters.javascript;
        const formatted = await formatter(code);
        return formatted;
    } catch (error) {
        console.error('Error formatting code:', error);
        return code;
    }
};

// Get available formatters
export const getAvailableFormatters = () => {
    return Object.keys(formatters);
};

// Check if language supports advanced formatting
export const supportsAdvancedFormatting = (language) => {
    return Object.keys(formatters).includes(language);
};
