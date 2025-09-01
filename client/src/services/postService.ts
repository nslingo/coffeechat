import { apiClient } from '../lib/api-client';

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
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: PostAuthor;
  availability: PostAvailability[];
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
export const postService = {
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