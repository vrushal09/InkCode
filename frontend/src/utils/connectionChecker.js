
import API, { apiRequest } from '../services/apiConfig';

/**
 * Checks the connection to the backend server and provides detailed diagnostics
 * @returns {Promise<Object>} Connection status and details
 */
const checkBackendConnection = async () => {
  try {
    console.log(`Attempting to connect to backend at: ${API.baseURL}`);
    
    // Try the health check endpoint
    const healthResponse = await apiRequest(API.endpoints.health, {
      method: 'GET',
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Backend health check succeeded:', healthData);
      
      return {
        connected: true,
        status: healthResponse.status,
        details: healthData,
        message: 'Successfully connected to backend server.'
      };
    } else {
      console.warn(`Backend health check failed with status: ${healthResponse.status}`);
      
      return {
        connected: false,
        status: healthResponse.status,
        message: `Backend server responded with error status: ${healthResponse.status}`
      };
    }
  } catch (error) {
    console.error('Backend connection error:', error);
    
    return {
      connected: false,
      error: error.message,
      message: `Failed to connect to backend server: ${error.message}. Please ensure the backend server is running.`
    };
  }
};

export default checkBackendConnection;
