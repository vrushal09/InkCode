import { useState, useEffect } from 'react';
import API, { apiRequest } from '../services/apiConfig';

const ConnectionDebugger = ({ visible = true, onClose }) => {
  const [backendUrl, setBackendUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBackendUrl(API.baseURL);
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    try {
      console.log(`Testing connection to backend at: ${API.baseURL}`);
      
      const response = await apiRequest(API.endpoints.health, { 
        method: 'GET',
        timeout: 10000
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('Connected');
        setResponseData(data);
        setError(null);
      } else {
        setConnectionStatus(`Error: ${response.status}`);
        setError(`Failed with HTTP status: ${response.status}`);
        try {
          const errorData = await response.text();
          setError(`HTTP ${response.status}: ${errorData}`);
        } catch (e) {
          // Ignore if we can't get error text
        }
      }
    } catch (err) {
      setConnectionStatus('Connection Failed');
      setError(err.message);
      console.error('Backend connection check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0A0A0A] border border-[#242424] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#242424] flex justify-between items-center bg-[#000000]">
          <h2 className="text-xl font-semibold text-[#FFFFFF]">Backend Connection Debugger</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-[#242424] rounded-lg transition-colors"
          >
            <svg className="h-5 w-5 text-[#FFFFFF]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <h3 className="text-[#FFFFFF] text-lg mb-2">Configuration</h3>
            <div className="bg-[#242424] p-4 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                <span className="text-[#FFFFFF]/70 font-medium min-w-32">Backend URL:</span>
                <code className="px-2 py-1 bg-black rounded text-green-400 flex-1 break-all">{backendUrl || 'Not configured'}</code>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                <span className="text-[#FFFFFF]/70 font-medium min-w-32">API Endpoints:</span>
                <code className="px-2 py-1 bg-black rounded text-blue-400 flex-1">
                  {Object.entries(API.endpoints).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))}
                </code>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-[#FFFFFF]/70 font-medium min-w-32">Environment:</span>
                <code className="px-2 py-1 bg-black rounded text-yellow-400 flex-1">
                  {import.meta.env.MODE || 'unknown'} 
                  {import.meta.env.PROD ? ' (production)' : import.meta.env.DEV ? ' (development)' : ''}
                </code>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-[#FFFFFF] text-lg mb-2">Connection Status</h3>
            <div className="bg-[#242424] p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  connectionStatus === 'Connected' ? 'bg-green-500' : 
                  connectionStatus === 'Checking...' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                }`}></div>
                <span className={`font-medium ${
                  connectionStatus === 'Connected' ? 'text-green-400' : 
                  connectionStatus === 'Checking...' ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {connectionStatus}
                </span>
                
                <button 
                  onClick={checkConnection} 
                  disabled={loading}
                  className="ml-auto px-3 py-1 bg-[#FFFFFF] text-[#000000] rounded-md hover:bg-[#FFFFFF]/90 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Checking...' : 'Test Again'}
                </button>
              </div>
              
              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded p-3 mb-4">
                  <h4 className="text-red-400 font-medium mb-1">Error</h4>
                  <code className="text-[#FFFFFF]/80 whitespace-pre-wrap break-all text-sm">{error}</code>
                  
                  <div className="mt-3 pt-3 border-t border-red-700/30">
                    <p className="text-sm text-red-300">
                      This could indicate a CORS issue, network problem, or that the backend server is not running.
                    </p>
                  </div>
                </div>
              )}
              
              {responseData && (
                <div>
                  <h4 className="text-green-400 font-medium mb-2">Server Response</h4>
                  <div className="bg-black/50 p-3 rounded">
                    <pre className="text-[#FFFFFF]/80 whitespace-pre-wrap overflow-x-auto text-sm">
                      {JSON.stringify(responseData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-[#FFFFFF] text-lg mb-2">Troubleshooting</h3>
            <div className="bg-[#242424] p-4 rounded-lg space-y-3">
              <div>
                <h4 className="text-[#FFFFFF] font-medium mb-1">1. Check that your backend is deployed and running</h4>
                <p className="text-[#FFFFFF]/70 text-sm">
                  Verify your backend is properly deployed on Render and the service is active.
                </p>
              </div>
              
              <div>
                <h4 className="text-[#FFFFFF] font-medium mb-1">2. Verify frontend environment variables</h4>
                <p className="text-[#FFFFFF]/70 text-sm">
                  Make sure your deployed frontend has the correct <code className="px-1 bg-black/50 rounded">VITE_API_URL</code> environment variable set in Vercel.
                </p>
              </div>
              
              <div>
                <h4 className="text-[#FFFFFF] font-medium mb-1">3. Check CORS configuration</h4>
                <p className="text-[#FFFFFF]/70 text-sm">
                  Make sure your backend CORS settings include your Vercel domain. The current CORS whitelist should include:
                </p>
                <code className="px-2 py-1 mt-1 block bg-black/50 rounded text-sm text-yellow-200 whitespace-pre-wrap">
                  {window.location.origin}
                </code>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-[#242424] bg-[#000000]">
          <div className="flex justify-between">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-[#242424] text-[#FFFFFF]/80 hover:bg-[#242424]/80 hover:text-[#FFFFFF] rounded-md transition-colors"
            >
              Close
            </button>
            <a 
              href={backendUrl + API.endpoints.health} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-[#FFFFFF] hover:bg-blue-700 rounded-md transition-colors"
            >
              Open API in Browser
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionDebugger;
