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

// Post API types
export interface PostAuthor {
  id: string;
  name: string;
  profilePicture?: string;
  averageRating: number;
  totalReviews: number;
  bio?: string;
}

export interface PostAvailability {
  id: string;
  day: string;
  timeSlot: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  type: 'TEACH' | 'LEARN';
  category: 'CAREER' | 'COURSEWORK' | 'HOBBIES';
  subject: string;
  courseCode?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: PostAuthor;
  availability: PostAvailability[];
  _count: {
    sessions: number;
  };
}

export interface CreatePostData {
  title: string;
  description: string;
  type: 'TEACH' | 'LEARN';
  category: 'CAREER' | 'COURSEWORK' | 'HOBBIES';
  subject: string;
  courseCode?: string;
  tags?: string[];
  availability?: Array<{
    day: string;
    timeSlot: string;
  }>;
}

export interface UpdatePostData {
  title?: string;
  description?: string;
  type?: 'TEACH' | 'LEARN';
  category?: 'CAREER' | 'COURSEWORK' | 'HOBBIES';
  subject?: string;
  courseCode?: string;
  tags?: string[];
  isActive?: boolean;
  availability?: Array<{
    day: string;
    timeSlot: string;
  }>;
}

export interface SearchPostsParams {
  type?: 'TEACH' | 'LEARN';
  category?: 'CAREER' | 'COURSEWORK' | 'HOBBIES';
  subject?: string;
  courseCode?: string;
  tags?: string; // comma-separated
  search?: string;
  page?: number;
  limit?: number;
  authorId?: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Post API functions
export const postApi = {
  // Get all posts with optional filtering
  getPosts: async (params?: SearchPostsParams): Promise<PostsResponse> => {
    const response = await apiClient.get<PostsResponse>('/api/posts', { params });
    return response.data;
  },

  // Get single post by ID
  getPost: async (postId: string): Promise<Post> => {
    const response = await apiClient.get<{ post: Post }>(`/api/posts/${postId}`);
    return response.data.post;
  },

  // Create new post
  createPost: async (data: CreatePostData): Promise<Post> => {
    const response = await apiClient.post<{ post: Post; message: string }>('/api/posts', data);
    return response.data.post;
  },

  // Update existing post
  updatePost: async (postId: string, data: UpdatePostData): Promise<Post> => {
    const response = await apiClient.put<{ post: Post; message: string }>(`/api/posts/${postId}`, data);
    return response.data.post;
  },

  // Delete/deactivate post
  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete<{ message: string }>(`/api/posts/${postId}`);
  },

  // Get current user's posts
  getMyPosts: async (params?: SearchPostsParams): Promise<PostsResponse> => {
    const response = await apiClient.get<PostsResponse>('/api/posts/my/posts', { params });
    return response.data;
  },
};

export { apiClient };