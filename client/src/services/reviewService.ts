import { apiClient } from '../lib/api-client';

// Review API types
export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  feedback?: string;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface CreateReviewData {
  revieweeId: string;
  rating: number;
  feedback?: string;
}

export interface UpdateReviewData {
  rating: number;
  feedback?: string;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  ratingDistribution: RatingDistribution[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Review API functions
export const reviewService = {
  // Create a review
  createReview: async (data: CreateReviewData): Promise<Review> => {
    const response = await apiClient.post<{ data: Review }>('/api/reviews', data);
    return response.data.data;
  },

  // Get reviews for a user
  getUserReviews: async (userId: string, page: number = 1, limit: number = 10): Promise<ReviewsResponse> => {
    const response = await apiClient.get<{ data: ReviewsResponse }>(`/api/reviews/user/${userId}?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Update a review
  updateReview: async (reviewId: string, data: UpdateReviewData): Promise<Review> => {
    const response = await apiClient.put<{ data: Review }>(`/api/reviews/${reviewId}`, data);
    return response.data.data;
  }
};