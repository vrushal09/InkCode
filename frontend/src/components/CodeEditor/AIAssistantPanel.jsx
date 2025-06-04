import React, { useState, useRef, useEffect } from 'react';
import { 
  SparklesIcon, 
  CodeBracketIcon, 
  BugAntIcon, 
  DocumentTextIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  ShieldCheckIcon,
  BeakerIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import useAI from '../../hooks/useAI';

const AIAssistantPanel = ({ 
  isOpen, 
  onClose, 
  currentCode = '', 
  currentLanguage = 'javascript',
  onCodeUpdate 
}) => {
  const [activeTab, setActiveTab] = useState('analyze');
  const [chatMessage, setChatMessage] = useState('');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [results, setResults] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const chatContainerRef = useRef(null);

  const {
    isLoading,
    error,
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
    clearError
  } = useAI();

  const tabs = [
    { id: 'analyze', label: 'Analyze', icon: SparklesIcon },
    { id: 'bugs', label: 'Bug Fix', icon: BugAntIcon },
    { id: 'refactor', label: 'Refactor', icon: ArrowPathIcon },
    { id: 'docs', label: 'Docs', icon: DocumentTextIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'tests', label: 'Tests', icon: BeakerIcon },
    { id: 'nlp', label: 'Natural', icon: CodeBracketIcon },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftIcon }
  ];

  const handleOperation = async (operation, ...args) => {
    try {
      clearError();
      const result = await operation(...args);
      setResults(prev => ({
        ...prev,
        [activeTab]: result
      }));
    } catch (err) {
      console.error(`AI operation failed:`, err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderAnalysisResult = (analysis) => {
    if (!analysis) return null;

    if (analysis.analysis) {
      return (
        <div className="prose prose-sm max-w-none text-gray-300">
          <pre className="whitespace-pre-wrap">{analysis.analysis}</pre>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {analysis.quality && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
            <h4 className="text-violet-400 font-semibold mb-2">Quality Score</h4>
            <div className="text-2xl font-bold text-white">{analysis.quality}/10</div>
          </div>
        )}

        {analysis.issues && analysis.issues.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <button
              onClick={() => toggleSection('issues')}
              className="flex items-center justify-between w-full text-red-400 font-semibold mb-2"
            >
              Issues Found ({analysis.issues.length})
              {expandedSections.issues ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            {expandedSections.issues && (
              <ul className="space-y-1 text-sm text-gray-300">
                {analysis.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {analysis.optimizations && analysis.optimizations.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <button
              onClick={() => toggleSection('optimizations')}
              className="flex items-center justify-between w-full text-yellow-400 font-semibold mb-2"
            >
              Optimizations ({analysis.optimizations.length})
              {expandedSections.optimizations ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            {expandedSections.optimizations && (
              <ul className="space-y-1 text-sm text-gray-300">
                {analysis.optimizations.map((opt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {analysis.bestPractices && analysis.bestPractices.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <button
              onClick={() => toggleSection('bestPractices')}
              className="flex items-center justify-between w-full text-green-400 font-semibold mb-2"
            >
              Best Practices ({analysis.bestPractices.length})
              {expandedSections.bestPractices ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            {expandedSections.bestPractices && (
              <ul className="space-y-1 text-sm text-gray-300">
                {analysis.bestPractices.map((practice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {analysis.security && analysis.security.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <button
              onClick={() => toggleSection('security')}
              className="flex items-center justify-between w-full text-blue-400 font-semibold mb-2"
            >
              Security ({analysis.security.length})
              {expandedSections.security ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
            {expandedSections.security && (
              <ul className="space-y-1 text-sm text-gray-300">
                {analysis.security.map((sec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{sec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    const result = results[activeTab];

    switch (activeTab) {
      case 'analyze':
        return (
          <div className="space-y-4">
            <button
              onClick={() => handleOperation(analyzeCode, currentCode, currentLanguage)}
              disabled={isLoading || !currentCode.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Code'}
            </button>
            {result && renderAnalysisResult(result)}
          </div>
        );

      case 'bugs':
        return (
          <div className="space-y-4">
            <button
              onClick={() => handleOperation(detectAndFixBugs, currentCode, currentLanguage)}
              disabled={isLoading || !currentCode.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Detecting Bugs...' : 'Find & Fix Bugs'}
            </button>
            {result && (
              <div className="space-y-4">
                {result.bugs && result.bugs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-red-400 font-semibold">Bugs Found:</h4>
                    {result.bugs.map((bug, idx) => (
                      <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            bug.severity === 'high' ? 'bg-red-600 text-white' :
                            bug.severity === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {bug.severity?.toUpperCase()}
                          </span>
                          {bug.line && <span className="text-gray-400 text-sm">Line {bug.line}</span>}
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{bug.issue}</p>
                        <p className="text-green-400 text-sm">{bug.fix}</p>
                      </div>
                    ))}
                  </div>
                )}
                {result.fixedCode && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-green-400 font-semibold">Fixed Code:</h4>
                      <button
                        onClick={() => onCodeUpdate && onCodeUpdate(result.fixedCode)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                      >
                        Apply Fix
                      </button>
                    </div>
                    <pre className="bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 overflow-x-auto">
                      {result.fixedCode}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'refactor':
        return (
          <div className="space-y-4">
            <button
              onClick={() => handleOperation(suggestRefactoring, currentCode, currentLanguage)}
              disabled={isLoading || !currentCode.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Analyzing...' : 'Suggest Refactoring'}
            </button>
            {result && (
              <div className="prose prose-sm max-w-none text-gray-300">
                <pre className="whitespace-pre-wrap bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-sm overflow-x-auto">
                  {result.suggestions}
                </pre>
              </div>
            )}
          </div>
        );

      case 'docs':
        return (
          <div className="space-y-4">
            <button
              onClick={() => handleOperation(generateDocumentation, currentCode, currentLanguage)}
              disabled={isLoading || !currentCode.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Documentation'}
            </button>
            {result && (
              <div className="prose prose-sm max-w-none text-gray-300">
                <pre className="whitespace-pre-wrap bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-sm overflow-x-auto">
                  {result.documentation}
                </pre>
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <button
              onClick={() => handleOperation(analyzeCodeSecurity, currentCode, currentLanguage)}
              disabled={isLoading || !currentCode.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Analyzing Security...' : 'Security Analysis'}
            </button>
            {result && renderAnalysisResult(result)}
          </div>
        );

      case 'tests':
        return (
          <div className="space-y-4">
            <button
              onClick={() => handleOperation(generateTests, currentCode, currentLanguage, 'jest')}
              disabled={isLoading || !currentCode.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Generating Tests...' : 'Generate Tests'}
            </button>
            {result && (
              <div className="prose prose-sm max-w-none text-gray-300">
                <pre className="whitespace-pre-wrap bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-sm overflow-x-auto">
                  {result.tests}
                </pre>
              </div>
            )}
          </div>
        );

      case 'nlp':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Describe what you want to code:
              </label>
              <textarea
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder="e.g., Create a function that validates email addresses..."
                className="w-full bg-[#0a0a0f] border border-gray-600 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                rows={3}
              />
            </div>
            <button
              onClick={() => handleOperation(naturalLanguageToCode, naturalLanguageInput, currentLanguage)}
              disabled={isLoading || !naturalLanguageInput.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Generating Code...' : 'Generate Code'}
            </button>
            {result && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-green-400 font-semibold">Generated Code:</h4>
                  <button
                    onClick={() => onCodeUpdate && onCodeUpdate(result.code)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                  >
                    Insert Code
                  </button>
                </div>
                <pre className="bg-[#0a0a0f] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 overflow-x-auto">
                  {result.code}
                </pre>
              </div>
            )}
          </div>
        );

      case 'chat':
        return (
          <div className="space-y-4 h-96 flex flex-col">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3">
              {result && result.response && (
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
                  <div className="text-violet-400 text-xs mb-1">AI Assistant</div>
                  <div className="text-gray-300 text-sm whitespace-pre-wrap">{result.response}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && chatMessage.trim() && handleOperation(chatWithAI, chatMessage, currentCode)}
                placeholder="Ask me anything about your code..."
                className="flex-1 bg-[#0a0a0f] border border-gray-600 rounded-lg px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={() => handleOperation(chatWithAI, chatMessage, currentCode)}
                disabled={isLoading || !chatMessage.trim()}
                className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d15] border border-gray-700 rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-xs rounded">
              {currentLanguage.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Close AI Assistant"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-500/10'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
