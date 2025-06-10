// ConnectionTest.jsx
import { useState, useEffect } from 'react';
import API, { apiRequest } from '../services/apiConfig';

export default function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('Loading...');
  const [backendUrl, setBackendUrl] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  
  useEffect(() => {
    // Display the backend URL from configuration
    setBackendUrl(API.baseURL);
    
    // Test connection to backend
    const testConnection = async () => {
      try {
        console.log('Testing connection to backend:', API.baseURL);
        
        const response = await apiRequest(API.endpoints.health, { 
          method: 'GET'
        });
        
        if (response.ok) {
          const data = await response.json();
          setConnectionStatus('Connected');
          setApiResponse(data);
        } else {
          setConnectionStatus(`Failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus(`Error: ${error.message}`);
      }
    };
    
    testConnection();
  }, []);
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#111', 
      borderRadius: '8px',
      margin: '10px',
      color: '#fff'
    }}>
      <h3>Backend Connection Test</h3>
      <p><strong>Backend URL:</strong> {backendUrl}</p>
      <p><strong>Status:</strong> <span style={{ 
        color: connectionStatus === 'Connected' ? 'green' : 'red'
      }}>{connectionStatus}</span></p>
      
      {apiResponse && (
        <div>
          <h4>API Response:</h4>
          <pre style={{ 
            backgroundColor: '#222', 
            padding: '10px', 
            borderRadius: '4px',
            overflowX: 'auto'
          }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
