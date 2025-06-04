// JDoodle API configuration
export const CODE_EXECUTION_CONFIG = {
  endpoint: 'https://api.jdoodle.com/v1/execute',
  clientId: '42f9c097d058e2448f77d3f046e0a836', // Replace with your JDoodle client ID
  clientSecret: 'f13ec722771d5dece53756d8cce5f40c299cd09205f2dbe1a6bc6bbfeffbe30f', // Replace with your JDoodle client secret
  timeout: 15000
};

// Language configurations for JDoodle API
export const LANGUAGE_CONFIGS = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    jdoodleLanguage: 'nodejs',
    versionIndex: '4',
    template: '// Welcome to JavaScript\nconsole.log("Hello, World!");'
  },
  python: {
    id: 'python',
    name: 'Python',
    jdoodleLanguage: 'python3',
    versionIndex: '4',
    template: '# Welcome to Python\nprint("Hello, World!")'
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    jdoodleLanguage: 'cpp17',
    versionIndex: '1',
    template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}'
  },
  c: {
    id: 'c',
    name: 'C',
    jdoodleLanguage: 'c',
    versionIndex: '5',
    template: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    jdoodleLanguage: 'nodejs',
    versionIndex: '4',
    template: '// Welcome to TypeScript\nconsole.log("Hello, World!");'
  },
  java: {
    id: 'java',
    name: 'Java',
    jdoodleLanguage: 'java',
    versionIndex: '4',
    template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
  },
  php: {
    id: 'php',
    name: 'PHP',
    jdoodleLanguage: 'php',
    versionIndex: '4',
    template: '<?php\necho "Hello, World!";\n?>'
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    jdoodleLanguage: 'ruby',
    versionIndex: '4',
    template: '# Welcome to Ruby\nputs "Hello, World!"'
  },
  go: {
    id: 'go',
    name: 'Go',
    jdoodleLanguage: 'go',
    versionIndex: '4',
    template: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}'
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    jdoodleLanguage: 'rust',
    versionIndex: '4',
    template: 'fn main() {\n    println!("Hello, World!");\n}'
  },  kotlin: {
    id: 'kotlin',
    name: 'Kotlin',
    jdoodleLanguage: 'kotlin',
    versionIndex: '4',
    template: 'fun main() {\n    println("Hello, World!")\n}'
  },
  swift: {
    id: 'swift',
    name: 'Swift',
    jdoodleLanguage: 'swift',
    versionIndex: '4',
    template: 'print("Hello, World!")'
  }
};