// Simple code execution configuration
export const CODE_EXECUTION_CONFIG = {
  // Using a mock execution for demo purposes
  // In production, you would use a backend service or serverless function
  endpoint: 'mock',
  timeout: 5000
};

// Language configurations for our supported languages
export const LANGUAGE_CONFIGS = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    template: '// Welcome to JavaScript\nconsole.log("Hello, World!");'
  },
  python: {
    id: 'python',
    name: 'Python',
    template: '# Welcome to Python\nprint("Hello, World!")'
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}'
  },
  c: {
    id: 'c',
    name: 'C',
    template: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    template: '// Welcome to TypeScript\nconsole.log("Hello, World!");'
  }
};