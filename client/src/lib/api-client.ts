import axios from 'axios';
import { authClient } from './auth-client';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth headers
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get the current session
      const session = await authClient.getSession();
      
      if (session?.data?.session.token) {
        config.headers.Authorization = `Bearer ${session.data.session.token}`;
      }
    } catch (error) {
      console.warn('Failed to get session for API request:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login
      console.warn('Unauthorized API request - user may need to log in again');
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };