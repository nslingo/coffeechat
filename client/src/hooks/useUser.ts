import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UserProfile, type UpdateProfileData, type User } from '../services/userService';

// Query keys for React Query
const QUERY_KEYS = {
  userProfile: ['user', 'profile'] as const,
  publicProfile: (userId: string) => ['user', 'public', userId] as const,
};

// Hook to get current user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.userProfile,
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Hook to update current user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updatedUser: User) => {
      // Update the cached profile data
      queryClient.setQueryData(QUERY_KEYS.userProfile, (oldData: UserProfile | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          ...updatedUser,
        };
      });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};

// Hook to get public user profile
export const usePublicProfile = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.publicProfile(userId),
    queryFn: () => userService.getPublicProfile(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};