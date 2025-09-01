import { apiClient } from '../lib/api-client';

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
export const userService = {
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