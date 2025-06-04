const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(functions.config().gemini?.api_key);

// Helper function to handle CORS
const handleCors = (request, response, handler) => {
  return cors(request, response, () => handler(request, response));
};

// AI Code Analysis Function
exports.analyzeCode = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { code, language = 'javascript' } = data;

    if (!code || !code.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Code is required');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Analyze the following ${language} code and provide a comprehensive analysis:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Please provide analysis in the following JSON format:
      {
        "quality": "score out of 10 with brief explanation",
        "issues": ["list of code issues with line numbers where possible"],
        "optimizations": ["list of performance optimizations"],
        "bestPractices": ["list of best practice recommendations"],
        "security": ["list of security considerations"],
        "complexity": "complexity analysis",
        "maintainability": "maintainability assessment"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // Try to parse JSON from response
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: analysisText };
    } catch (parseError) {
      analysis = { analysis: analysisText };
    }

    // Save analysis to Firestore
    await admin.firestore().collection('ai_analyses').add({
      userId: context.auth.uid,
      code: code.substring(0, 1000), // Store first 1000 chars for reference
      language,
      analysis,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'code_analysis'
    });

    return {
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Code analysis error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze code', error.message);
  }
});

// AI Bug Detection Function
exports.detectBugs = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { code, language = 'javascript' } = data;

    if (!code || !code.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Code is required');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Analyze the following ${language} code for bugs and provide fixes:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Please respond in JSON format:
      {
        "bugs": [
          {
            "line": number,
            "issue": "description of the bug",
            "severity": "high|medium|low",
            "fix": "suggested fix",
            "explanation": "why this is a bug"
          }
        ],
        "fixedCode": "complete corrected code if bugs were found",
        "summary": "overall bug analysis summary"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const bugAnalysisText = response.text();

    let bugAnalysis;
    try {
      const jsonMatch = bugAnalysisText.match(/\{[\s\S]*\}/);
      bugAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: bugAnalysisText };
    } catch (parseError) {
      bugAnalysis = { analysis: bugAnalysisText };
    }

    // Save bug analysis to Firestore
    await admin.firestore().collection('ai_analyses').add({
      userId: context.auth.uid,
      code: code.substring(0, 1000),
      language,
      analysis: bugAnalysis,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'bug_detection'
    });

    return {
      success: true,
      bugAnalysis,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Bug detection error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to detect bugs', error.message);
  }
});

// AI Code Generation Function
exports.generateCode = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { description, language = 'javascript', context: codeContext = '' } = data;

    if (!description || !description.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Description is required');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate ${language} code based on the following description:
      
      Description: "${description}"
      ${codeContext ? `Context: ${codeContext}` : ''}
      
      Requirements:
      1. Generate clean, well-commented ${language} code
      2. Follow best practices and conventions
      3. Include error handling where appropriate
      4. Make the code production-ready
      5. Add JSDoc/docstring comments where applicable
      
      Please provide only the code without additional explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedCode = response.text();

    // Clean up the code (remove markdown formatting)
    const cleanCode = generatedCode.replace(/```[\w]*\n?/g, '').trim();

    // Save generation to Firestore
    await admin.firestore().collection('ai_generations').add({
      userId: context.auth.uid,
      description,
      language,
      generatedCode: cleanCode,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'code_generation'
    });

    return {
      success: true,
      code: cleanCode,
      language,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Code generation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate code', error.message);
  }
});

// AI Code Documentation Function
exports.generateDocumentation = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { code, language = 'javascript', docType = 'comprehensive' } = data;

    if (!code || !code.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Code is required');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate comprehensive documentation for the following ${language} code:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Please generate ${docType} documentation including:
      1. Function/class descriptions
      2. Parameter descriptions with types
      3. Return value descriptions
      4. Usage examples
      5. Edge cases and error handling
      6. Performance considerations
      7. Dependencies and requirements
      
      Format the documentation appropriately for ${language} (JSDoc, docstrings, etc.)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const documentation = response.text();

    // Save documentation to Firestore
    await admin.firestore().collection('ai_documentation').add({
      userId: context.auth.uid,
      code: code.substring(0, 1000),
      language,
      documentation,
      docType,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      documentation,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Documentation generation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate documentation', error.message);
  }
});

// AI Security Analysis Function
exports.analyzeCodeSecurity = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { code, language = 'javascript' } = data;

    if (!code || !code.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Code is required');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Perform a comprehensive security analysis of the following ${language} code:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Analyze for these security vulnerabilities:
      1. SQL injection vulnerabilities
      2. XSS (Cross-Site Scripting) vulnerabilities
      3. Authentication and authorization issues
      4. Input validation problems
      5. Sensitive data exposure
      6. Insecure dependencies or imports
      7. CSRF vulnerabilities
      8. Code injection risks
      9. Information disclosure
      10. Buffer overflows (for applicable languages)
      
      Please respond in JSON format:
      {
        "overallSecurityScore": "score out of 10",
        "vulnerabilities": [
          {
            "type": "vulnerability type",
            "severity": "critical|high|medium|low",
            "line": "line number if applicable",
            "description": "detailed description",
            "impact": "potential impact",
            "fix": "recommended fix",
            "cweId": "CWE ID if applicable"
          }
        ],
        "recommendations": ["general security recommendations"],
        "secureCodeAlternative": "more secure version of the code if needed"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const securityAnalysisText = response.text();

    let securityAnalysis;
    try {
      const jsonMatch = securityAnalysisText.match(/\{[\s\S]*\}/);
      securityAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: securityAnalysisText };
    } catch (parseError) {
      securityAnalysis = { analysis: securityAnalysisText };
    }

    // Save security analysis to Firestore
    await admin.firestore().collection('ai_security_analyses').add({
      userId: context.auth.uid,
      code: code.substring(0, 1000),
      language,
      analysis: securityAnalysis,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'security_analysis'
    });

    return {
      success: true,
      securityAnalysis,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Security analysis error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze code security', error.message);
  }
});

// AI Test Generation Function
exports.generateTests = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { code, language = 'javascript', testFramework = 'jest' } = data;

    if (!code || !code.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Code is required');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate comprehensive test cases for the following ${language} code using ${testFramework}:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Generate tests that include:
      1. Unit tests for all functions/methods
      2. Edge case testing
      3. Error handling tests
      4. Integration tests where applicable
      5. Mock data and setup
      6. Assertion coverage for all code paths
      7. Performance tests if relevant
      
      Use ${testFramework} syntax and best practices.
      Include proper test structure, setup, teardown, and descriptive test names.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tests = response.text();

    // Clean up the tests (remove markdown formatting)
    const cleanTests = tests.replace(/```[\w]*\n?/g, '').trim();

    // Save test generation to Firestore
    await admin.firestore().collection('ai_test_generations').add({
      userId: context.auth.uid,
      code: code.substring(0, 1000),
      language,
      testFramework,
      tests: cleanTests,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      tests: cleanTests,
      framework: testFramework,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Test generation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate tests', error.message);
  }
});

// AI Chat Function
exports.chatWithAI = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { message, codeContext = '', conversationHistory = [] } = data;

    if (!message || !message.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Message is required');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = conversationHistory.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n') + '\n';
    }

    const prompt = `
      You are an AI coding assistant helping developers with their code. 
      
      ${conversationContext ? `Previous conversation:\n${conversationContext}` : ''}
      
      ${codeContext ? `Current code context:\n\`\`\`\n${codeContext}\n\`\`\`` : ''}
      
      User question: ${message}
      
      Please provide helpful, accurate coding advice. Include code examples when appropriate.
      Keep your response concise but comprehensive.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Save chat interaction to Firestore
    await admin.firestore().collection('ai_chat_history').add({
      userId: context.auth.uid,
      userMessage: message,
      aiResponse,
      codeContext: codeContext.substring(0, 500),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('AI chat error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process chat message', error.message);
  }
});

// Usage Analytics Function
exports.getAIUsageStats = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const { timeRange = '7d' } = data;

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get usage statistics
    const [analyses, generations, chats] = await Promise.all([
      admin.firestore()
        .collection('ai_analyses')
        .where('userId', '==', userId)
        .where('timestamp', '>=', startDate)
        .get(),
      admin.firestore()
        .collection('ai_generations')
        .where('userId', '==', userId)
        .where('timestamp', '>=', startDate)
        .get(),
      admin.firestore()
        .collection('ai_chat_history')
        .where('userId', '==', userId)
        .where('timestamp', '>=', startDate)
        .get()
    ]);

    const stats = {
      totalAnalyses: analyses.size,
      totalGenerations: generations.size,
      totalChatMessages: chats.size,
      totalInteractions: analyses.size + generations.size + chats.size,
      timeRange,
      languageBreakdown: {},
      dailyUsage: {}
    };

    // Analyze language usage
    [...analyses.docs, ...generations.docs].forEach(doc => {
      const data = doc.data();
      if (data.language) {
        stats.languageBreakdown[data.language] = (stats.languageBreakdown[data.language] || 0) + 1;
      }
    });

    return {
      success: true,
      stats,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Usage stats error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get usage statistics', error.message);
  }
});

// Cleanup old data function (runs daily)
exports.cleanupOldAIData = functions.pubsub.schedule('0 2 * * *').onRun(async (context) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const collections = [
    'ai_analyses',
    'ai_generations',
    'ai_chat_history',
    'ai_documentation',
    'ai_security_analyses',
    'ai_test_generations'
  ];

  const batch = admin.firestore().batch();
  let deleteCount = 0;

  for (const collectionName of collections) {
    const oldDocs = await admin.firestore()
      .collection(collectionName)
      .where('timestamp', '<', thirtyDaysAgo)
      .limit(500) // Batch delete limit
      .get();

    oldDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
      deleteCount++;
    });
  }

  if (deleteCount > 0) {
    await batch.commit();
    console.log(`Cleaned up ${deleteCount} old AI data records`);
  }

  return null;
});
