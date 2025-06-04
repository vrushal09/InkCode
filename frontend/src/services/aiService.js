import { GoogleGenerativeAI } from '@google/generative-ai';
import { httpsCallable } from 'firebase/functions';
import { functions, auth, firestore } from '../config/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, where, serverTimestamp } from 'firebase/firestore';

// Initialize Google Generative AI with proper error handling
const initializeGenAI = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey.length < 10 || !apiKey.startsWith('AIzaSy')) {
        console.warn('Gemini API key not configured properly. AI features will use fallback methods.');
        return null;
    }

    try {
        console.log('Initializing Google Generative AI with API key:', apiKey.substring(0, 10) + '...');
        return new GoogleGenerativeAI(apiKey);
    } catch (error) {
        console.error('Failed to initialize Google Generative AI:', error);
        return null;
    }
};

const genAI = initializeGenAI();

// AI Service Class
class AIService {
    constructor() {
        this.isConfigured = !!genAI;        if (this.isConfigured) {
            try {
                console.log('Creating AI models...');
                this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                this.codeModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                console.log('AI models created successfully');
                
                // Log Firestore status
                if (import.meta.env.DEV || import.meta.env.NODE_ENV === 'development') {
                    console.log('AI Service: Running in development mode - Firestore interactions disabled');
                } else {
                    console.log('AI Service: Running in production mode - Firestore interactions enabled');
                }
            } catch (error) {
                console.error('Failed to create AI models:', error);
                this.isConfigured = false;
                this.model = null;
                this.codeModel = null;
            }
        } else {
            console.warn('AI service not configured - models will be null');
            this.model = null;
            this.codeModel = null;
        }
    }

    // Check if AI is properly configured
    checkConfiguration() {
        if (!this.isConfigured) {
            throw new Error('AI service is not configured. Please add a valid VITE_GEMINI_API_KEY to your .env file.');
        }
        if (!this.model || !this.codeModel) {
            throw new Error('AI models are not initialized properly.');
        }
    }

    // Code Analysis and Suggestions
    async analyzeCode(code, language = 'javascript') {
        try {
            this.checkConfiguration();

            // Try server-side function first (more powerful)
            try {
                const serverResult = await this.callServerSideAI('analyzeCode', { code, language });
                if (serverResult.success) {
                    await this.saveInteraction('analyzeCode', { code, language }, serverResult.analysis);
                    return serverResult.analysis;
                }
            } catch (serverError) {
                console.warn('Server-side analysis failed, falling back to client-side:', serverError);
            }

            // Fallback to client-side analysis
            const prompt = `
        Analyze the following ${language} code and provide:
        1. Code quality assessment
        2. Potential bugs or issues
        3. Performance optimization suggestions
        4. Best practices recommendations
        5. Security considerations

        Code:
        \`\`\`${language}
        ${code}
        \`\`\`

        Please format your response in JSON with the following structure:
        {
          "quality": "score out of 10",
          "issues": ["list of issues"],
          "optimizations": ["list of optimizations"],
          "bestPractices": ["list of best practices"],
          "security": ["list of security considerations"]
        }
      `;

            const result = await this.codeModel.generateContent(prompt);
            const response = await result.response;

            // Try to parse JSON response, fallback to plain text
            try {
                const jsonMatch = response.text().match(/\{[\s\S]*\}/);
                const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: response.text() };
                await this.saveInteraction('analyzeCode', { code, language }, analysis);
                return analysis;
            } catch (parseError) {
                const analysis = { analysis: response.text() };
                await this.saveInteraction('analyzeCode', { code, language }, analysis);
                return analysis;
            }
        } catch (error) {
            console.error('Code analysis failed:', error);
            throw new Error('Failed to analyze code');
        }
    }    // Code Completion and Suggestions
    async getCodeCompletion(code, language = 'javascript', context = '') {
        try {
            this.checkConfiguration();

            const prompt = `
        Given the following ${language} code context, suggest the next few lines of code:
        
        Context: ${context}
        
        Current code:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Provide only the code completion without explanations:
      `;

            const result = await this.codeModel.generateContent(prompt);
            const response = await result.response;

            return {
                suggestion: response.text().replace(/```[\w]*\n?/g, '').trim(),
                confidence: 0.8 // Mock confidence score
            };
        } catch (error) {
            console.error('Code completion failed:', error);
            throw new Error('Failed to get code completion');
        }
    }    // Bug Detection and Fixes
    async detectAndFixBugs(code, language = 'javascript') {
        try {
            this.checkConfiguration();
            const prompt = `
        Analyze the following ${language} code for bugs and provide fixes:
        
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Respond in JSON format:
        {
          "bugs": [
            {
              "line": number,
              "issue": "description",
              "severity": "high|medium|low",
              "fix": "suggested fix"
            }
          ],
          "fixedCode": "complete corrected code"
        }
      `;

            const result = await this.codeModel.generateContent(prompt);
            const response = await result.response;

            try {
                const jsonMatch = response.text().match(/\{[\s\S]*\}/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: response.text() };
            } catch (parseError) {
                return { analysis: response.text() };
            }
        } catch (error) {
            console.error('Bug detection failed:', error);
            throw new Error('Failed to detect bugs');
        }
    }    // Code Documentation Generation
    async generateDocumentation(code, language = 'javascript') {
        try {
            this.checkConfiguration();

            const prompt = `
        Generate comprehensive documentation for the following ${language} code:
        
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Include:
        1. Function/class descriptions
        2. Parameter descriptions
        3. Return value descriptions
        4. Usage examples
        5. JSDoc/docstring format where appropriate
      `;

            const result = await this.codeModel.generateContent(prompt);
            const response = await result.response;

            return {
                documentation: response.text(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Documentation generation failed:', error);
            throw new Error('Failed to generate documentation');
        }
    }    // Code Refactoring Suggestions
    async suggestRefactoring(code, language = 'javascript') {
        try {
            this.checkConfiguration();

            const prompt = `
        Suggest refactoring improvements for the following ${language} code:
        
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Focus on:
        1. Code readability
        2. Maintainability
        3. Performance
        4. Design patterns
        5. SOLID principles
        
        Provide both suggestions and refactored code examples.
      `;

            const result = await this.codeModel.generateContent(prompt);
            const response = await result.response;

            return {
                suggestions: response.text(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Refactoring suggestions failed:', error);
            throw new Error('Failed to suggest refactoring');
        }
    }    // Natural Language to Code
    async naturalLanguageToCode(description, language = 'javascript') {
        try {
            this.checkConfiguration();

            const prompt = `
        Convert the following natural language description to ${language} code:
        
        "${description}"
        
        Provide clean, well-commented code that implements the described functionality.
        Include error handling where appropriate.
      `;

            const result = await this.codeModel.generateContent(prompt);
            const response = await result.response;

            return {
                code: response.text().replace(/```[\w]*\n?/g, '').trim(),
                language: language,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Natural language to code conversion failed:', error);
            throw new Error('Failed to convert natural language to code');
        }
    }    // Code Explanation
    async explainCode(code, language = 'javascript') {
        try {
            this.checkConfiguration();

            const prompt = `
        Explain the following ${language} code in simple terms:
        
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Provide:
        1. What the code does
        2. How it works
        3. Key concepts used
        4. Potential use cases
      `;

            const result = await this.codeModel.generateContent(prompt);
            const response = await result.response;

            return {
                explanation: response.text(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Code explanation failed:', error);
            throw new Error('Failed to explain code');
        }
    }    // Chat with AI about coding
    async chatWithAI(message, context = '') {
        try {
            this.checkConfiguration();

            const prompt = `
        You are an AI coding assistant. Help with the following question:
        
        ${context ? `Context: ${context}` : ''}
        
        Question: ${message}
        
        Provide helpful, accurate coding advice and examples when appropriate.
      `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;

            return {
                response: response.text(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('AI chat failed:', error);
            throw new Error('Failed to chat with AI');
        }
    }    // Check if Firestore should be used (disabled in development to prevent connection errors)
    isFirestoreEnabled() {
        // Disable Firestore in development mode to prevent 400 errors
        if (import.meta.env.DEV || import.meta.env.NODE_ENV === 'development') {
            return false;
        }
        return firestore !== null && firestore !== undefined;
    }

    // Save AI interaction to Firestore
    async saveInteraction(type, input, output, userId = null) {
        try {
            // Skip Firestore operations in development or if not available
            if (!this.isFirestoreEnabled()) {
                console.log('Firestore disabled in development mode - skipping interaction save');
                return null;
            }

            if (!userId && auth.currentUser) {
                userId = auth.currentUser.uid;
            }

            const interaction = {
                type,
                input,
                output,
                userId: userId || 'anonymous',
                timestamp: serverTimestamp(),
                createdAt: new Date().toISOString()
            };

            console.log('Saving AI interaction:', { type, userId: userId || 'anonymous' });
            const docRef = await addDoc(collection(firestore, 'ai_interactions'), interaction);
            console.log('AI interaction saved with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.warn('Failed to save AI interaction (non-critical):', error.message);
            // Don't log full error details in production to avoid console spam
            if (import.meta.env.DEV) {
                console.error('Firestore error details:', error);
            }
            // Don't throw error as this is optional functionality
            return null;
        }
    }    // Get AI interaction history
    async getInteractionHistory(userId = null, limitCount = 10) {
        try {
            // Skip Firestore operations in development or if not available
            if (!this.isFirestoreEnabled()) {
                console.log('Firestore disabled in development mode - returning empty history');
                return [];
            }

            if (!userId && auth.currentUser) {
                userId = auth.currentUser.uid;
            }

            if (!userId) return [];

            const q = query(
                collection(firestore, 'ai_interactions'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const interactions = [];

            querySnapshot.forEach((doc) => {
                interactions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return interactions;
        } catch (error) {
            console.warn('Failed to get interaction history (non-critical):', error.message);
            return [];
        }
    }

    // Firebase Functions Integration (for server-side AI processing)
    async callServerSideAI(functionName, data) {
        try {
            const callable = httpsCallable(functions, functionName);
            const result = await callable(data);
            return result.data;
        } catch (error) {
            console.error(`Server-side AI function ${functionName} failed:`, error);
            throw new Error(`Failed to call ${functionName}`);
        }
    }    // Code Security Analysis
    async analyzeCodeSecurity(code, language = 'javascript') {
        try {
            this.checkConfiguration();

            const prompt = `
        Perform a security analysis of the following ${language} code:
        
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Check for:
        1. SQL injection vulnerabilities
        2. XSS vulnerabilities
        3. Authentication issues
        4. Authorization problems
        5. Data validation issues
        6. Insecure dependencies
        7. Sensitive data exposure
        
        Respond in JSON format with vulnerability details and fixes.
      `;

            const result = await this.codeModel.generateContent(prompt);
            const response = await result.response;

            try {
                const jsonMatch = response.text().match(/\{[\s\S]*\}/);
                return jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: response.text() };
            } catch (parseError) {
                return { analysis: response.text() };
            }
        } catch (error) {
            console.error('Security analysis failed:', error);
            throw new Error('Failed to analyze code security');
        }
    }    // Generate Test Cases
    async generateTests(code, language = 'javascript', testFramework = 'jest') {
        try {
            this.checkConfiguration();

            const prompt = `
        Generate comprehensive test cases for the following ${language} code using ${testFramework}:
        
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Include:
        1. Unit tests for all functions
        2. Edge cases
        3. Error handling tests
        4. Integration tests where applicable
        5. Mock data and setup
      `;

            const result = await this.codeModel.generateContent(prompt);
            const response = await result.response;

            return {
                tests: response.text(),
                framework: testFramework,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Test generation failed:', error);
            throw new Error('Failed to generate tests');
        }
    }
}

// Create and export singleton instance
const aiService = new AIService();
export default aiService;

// Note: Individual method exports are not needed as they would lose the 'this' context
// Always use aiService.methodName() or import the default aiService instance
