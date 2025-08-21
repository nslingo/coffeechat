import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging (optional)
apiClient.interceptors.request.use(
  (config) => {
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

// User API types
export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  averageRating: number;
  totalReviews: number;
  emailVerified: boolean;
  createdAt: string;
}

export interface UserStats {
  activePosts: number;
  completedSessions: number;
  responseRate: number;
}

export interface UserProfile extends User {
  stats: UserStats;
}

export interface UpdateProfileData {
  bio?: string;
  profilePicture?: string;
}

// User API functions
export const userApi = {
  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<{ user: UserProfile }>('/api/users/profile');
    return response.data.user;
  },

  // Update current user profile
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put<{ user: User; message: string }>('/api/users/profile', data);
    return response.data.user;
  },

  // Get public user profile by ID
  getPublicProfile: async (userId: string): Promise<User> => {
    const response = await apiClient.get<{ user: User }>(`/api/users/profile/${userId}`);
    return response.data.user;
  },
};

export { apiClient };