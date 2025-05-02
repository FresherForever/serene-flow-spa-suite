// Define API URL based on environment
export const API_URL = 
  import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://your-backend-url.com/api' : 'http://localhost:5000/api');

// Use this for API calls
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};