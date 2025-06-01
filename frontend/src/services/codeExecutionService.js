// JavaScript code execution in browser using eval (for demo purposes)
const executeJavaScript = (code, input) => {
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

// Python-like code simulation
const executePython = (code, input) => {
    try {
        const output = [];
        
        // Simple print function simulation
        const printStatements = code.match(/print\(([^)]+)\)/g);
        if (printStatements) {
            printStatements.forEach(statement => {
                const content = statement.match(/print\(([^)]+)\)/)[1];
                // Remove quotes and evaluate simple expressions
                let value = content.replace(/['"]/g, '');
                
                // Handle simple variables and string concatenation
                if (value.includes('+')) {
                    // Simple string concatenation
                    const parts = value.split('+').map(part => part.trim().replace(/['"]/g, ''));
                    value = parts.join('');
                }
                
                output.push(value);
            });
        }
        
        // Handle input() function
        if (code.includes('input(') && input) {
            const inputLines = input.split('\n');
            let inputIndex = 0;
            
            code.split('\n').forEach(line => {
                if (line.includes('input(') && inputIndex < inputLines.length) {
                    const varMatch = line.match(/(\w+)\s*=\s*input\(/);
                    if (varMatch) {
                        const varName = varMatch[1];
                        const inputValue = inputLines[inputIndex++];
                        output.push(`${varName} = ${inputValue}`);
                    }
                }
            });
        }
        
        // Basic math operations
        const mathExpressions = code.match(/print\((\d+[\+\-\*\/]\d+)\)/g);
        if (mathExpressions) {
            mathExpressions.forEach(expr => {
                const mathPart = expr.match(/print\((\d+[\+\-\*\/]\d+)\)/)[1];
                try {
                    const result = eval(mathPart);
                    output.push(result.toString());
                } catch (e) {
                    output.push(mathPart);
                }
            });
        }
        
        return output.length > 0 ? output.join('\n') : 'Code executed successfully (no output)';
    } catch (error) {
        return `Error: ${error.message}`;
    }
};

// C/C++ simulation
const executeC = (code, input) => {
    try {
        const output = [];
        
        // Simple printf simulation
        const printfStatements = code.match(/printf\([^)]+\)/g);
        if (printfStatements) {
            printfStatements.forEach(statement => {
                const content = statement.match(/printf\(\s*"([^"]+)"/);
                if (content) {
                    let value = content[1];
                    value = value.replace(/\\n/g, ''); // Remove newline characters
                    output.push(value);
                }
            });
        }
        
        return output.length > 0 ? output.join('\n') : 'Code compiled and executed successfully (no output)';
    } catch (error) {
        return `Error: ${error.message}`;
    }
};

// C++ simulation  
const executeCpp = (code, input) => {
    try {
        const output = [];
        
        // Simple cout simulation
        const coutStatements = code.match(/cout\s*<<[^;]+/g);
        if (coutStatements) {
            coutStatements.forEach(statement => {
                // Extract the content after <<
                const content = statement.match(/cout\s*<<\s*"([^"]+)"/);
                if (content) {
                    output.push(content[1]);
                } else {
                    // Handle variables or simple expressions
                    const varContent = statement.match(/cout\s*<<\s*([^;]+)/);
                    if (varContent) {
                        let value = varContent[1].trim();
                        if (value === 'endl') {
                            output.push('');
                        } else {
                            output.push(value);
                        }
                    }
                }
            });
        }
        
        return output.length > 0 ? output.join('\n') : 'Code compiled and executed successfully (no output)';
    } catch (error) {
        return `Error: ${error.message}`;
    }
};

export const codeExecutionService = {
    async executeCode(code, language, input = '') {
        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        try {
            let result = '';
            
            switch (language) {
                case 'javascript':
                case 'typescript':
                    result = executeJavaScript(code, input);
                    break;
                    
                case 'python':
                    result = executePython(code, input);
                    break;
                    
                case 'c':
                    result = executeC(code, input);
                    break;
                    
                case 'cpp':
                    result = executeCpp(code, input);
                    break;
                    
                default:
                    result = 'Language not supported in demo mode';
            }
            
            // Add input information if provided
            if (input && input.trim()) {
                result += `\n\n--- Input provided ---\n${input}`;
            }
            
            return result;
            
        } catch (error) {
            return `Execution Error: ${error.message}`;
        }
    }
};
