import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService, type Post, type CreatePostData, type UpdatePostData, type SearchPostsParams } from '../services/postService';

// Query keys for React Query
const QUERY_KEYS = {
  posts: (params?: SearchPostsParams) => ['posts', params] as const,
  post: (postId: string) => ['post', postId] as const,
  myPosts: (params?: SearchPostsParams) => ['posts', 'my', params] as const,
};

// Hook to get posts with search/filter
export const usePosts = (params?: SearchPostsParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.posts(params),
    queryFn: () => postService.getPosts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Hook to get single post
export const usePost = (postId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.post(postId),
    queryFn: () => postService.getPost(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Hook to get current user's posts
export const useMyPosts = (params?: SearchPostsParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.myPosts(params),
    queryFn: () => postService.getMyPosts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Hook to create new post
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postService.createPost,
    onSuccess: () => {
      // Invalidate and refetch posts queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Post creation failed:', error);
    },
  });
};

// Hook to update post
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: UpdatePostData }) => 
      postService.updatePost(postId, data),
    onSuccess: (updatedPost: Post) => {
      // Update the cached post data
      queryClient.setQueryData(QUERY_KEYS.post(updatedPost.id), updatedPost);
      // Invalidate posts lists to refetch them
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Post update failed:', error);
    },
  });
};

// Hook to delete post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () => {
      // Invalidate and refetch posts queries
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Post deletion failed:', error);
    },
  });
};