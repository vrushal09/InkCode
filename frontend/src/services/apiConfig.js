/**
 * API Configuration for InkCode
 * 
 * This file provides centralized configuration for API endpoints
 * and handles environment-specific URLs.
 */

// Get the base URL from environment variables
// In production: https://inkcode-ymp9.onrender.com
// In development: http://localhost:5000
const getBaseUrl = () => {
  // For Vite
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For Next.js (if used in the future)
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback to localhost
  return 'http://localhost:5000';
};

// API Endpoints
const API = {
  baseURL: getBaseUrl(),
  endpoints: {
    health: '/api/health',
    execute: '/api/execute',
    languages: '/api/languages'
  }
};

/**
 * Makes API requests with the correct base URL from environment variables
 * @param {string} endpoint - The API endpoint to call
 * @param {object} options - Fetch options
 * @returns {Promise} - Fetch promise
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API.baseURL}${endpoint}`;
  
  console.log(`API Request to: ${url}`);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    // Add credentials mode for proper CORS handling
    credentials: options.credentials || 'same-origin'
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Log the response status for debugging
    console.log(`API Response from ${endpoint}: Status ${response.status}`);
    
    // Clone the response for logging purposes while preserving it for the caller
    if (response.ok && endpoint === API.endpoints.health) {
      const clonedResponse = response.clone();
      clonedResponse.json().then(data => {
        console.log('Backend health data:', data);
      }).catch(() => {}); // Ignore parsing errors in the debug code
    }
    
    return response;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
};

export { apiRequest };
export default API;
