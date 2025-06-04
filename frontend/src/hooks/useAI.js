import { useState, useCallback, useEffect } from 'react';
import aiService from '../services/aiService';
import { auth } from '../config/firebase';

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Load interaction history on mount
  useEffect(() => {
    const loadHistory = async () => {
      if (auth.currentUser) {
        try {
          const interactions = await aiService.getInteractionHistory();
          setHistory(interactions);
        } catch (err) {
          console.error('Failed to load AI history:', err);
        }
      }
    };

    loadHistory();
  }, []);
  // Generic AI operation wrapper
  const performAIOperation = useCallback(async (operation, operationName = 'unknown') => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      
      // Save interaction to history if it's a major operation
      if (operationName !== 'getInteractionHistory') {
        try {
          await aiService.saveInteraction(
            operationName,
            'operation_data',
            result,
            auth.currentUser?.uid
          );
        } catch (saveError) {
          console.warn('Failed to save interaction:', saveError);
        }
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);  // Code Analysis
  const analyzeCode = useCallback(async (code, language = 'javascript') => {
    return performAIOperation(() => aiService.analyzeCode(code, language), 'analyzeCode');
  }, [performAIOperation]);

  // Code Completion
  const getCodeCompletion = useCallback(async (code, language = 'javascript', context = '') => {
    return performAIOperation(() => aiService.getCodeCompletion(code, language, context), 'getCodeCompletion');
  }, [performAIOperation]);
  // Bug Detection
  const detectAndFixBugs = useCallback(async (code, language = 'javascript') => {
    return performAIOperation(() => aiService.detectAndFixBugs(code, language), 'detectAndFixBugs');
  }, [performAIOperation]);

  // Documentation Generation
  const generateDocumentation = useCallback(async (code, language = 'javascript') => {
    return performAIOperation(() => aiService.generateDocumentation(code, language), 'generateDocumentation');
  }, [performAIOperation]);

  // Refactoring Suggestions
  const suggestRefactoring = useCallback(async (code, language = 'javascript') => {
    return performAIOperation(() => aiService.suggestRefactoring(code, language), 'suggestRefactoring');
  }, [performAIOperation]);

  // Natural Language to Code
  const naturalLanguageToCode = useCallback(async (description, language = 'javascript') => {
    return performAIOperation(() => aiService.naturalLanguageToCode(description, language), 'naturalLanguageToCode');
  }, [performAIOperation]);

  // Code Explanation
  const explainCode = useCallback(async (code, language = 'javascript') => {
    return performAIOperation(() => aiService.explainCode(code, language), 'explainCode');
  }, [performAIOperation]);

  // AI Chat
  const chatWithAI = useCallback(async (message, context = '') => {
    return performAIOperation(() => aiService.chatWithAI(message, context), 'chatWithAI');
  }, [performAIOperation]);

  // Security Analysis
  const analyzeCodeSecurity = useCallback(async (code, language = 'javascript') => {
    return performAIOperation(() => aiService.analyzeCodeSecurity(code, language), 'analyzeCodeSecurity');
  }, [performAIOperation]);

  // Test Generation
  const generateTests = useCallback(async (code, language = 'javascript', testFramework = 'jest') => {
    return performAIOperation(() => aiService.generateTests(code, language, testFramework), 'generateTests');
  }, [performAIOperation]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh history
  const refreshHistory = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const interactions = await aiService.getInteractionHistory();
        setHistory(interactions);
      } catch (err) {
        console.error('Failed to refresh AI history:', err);
      }
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    history,

    // Methods
    analyzeCode,
    getCodeCompletion,
    detectAndFixBugs,
    generateDocumentation,
    suggestRefactoring,
    naturalLanguageToCode,
    explainCode,
    chatWithAI,
    analyzeCodeSecurity,
    generateTests,

    // Utilities
    clearError,
    refreshHistory
  };
};

export default useAI;
