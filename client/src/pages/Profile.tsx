import { useState, useEffect } from 'react';
import { useUserProfile, useUpdateProfile } from '../hooks/useUser';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: userProfile, isLoading, error } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    profilePicture: '',
  });

  // Initialize form when userProfile loads
  useEffect(() => {
    if (userProfile && !isEditing) {
      setEditForm({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        profilePicture: userProfile.profilePicture || '',
      });
    }
  }, [userProfile, isEditing]);

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center text-red-600">
            <p>Failed to load profile. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-blue-600">
                  {(userProfile.displayName || userProfile.name).split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userProfile.displayName || userProfile.name}</h1>
                <p className="text-gray-600">{userProfile.email}</p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-medium text-gray-900 ml-1">{userProfile.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500 ml-2">({userProfile.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userProfile.stats.completedSessions}</div>
              <div className="text-sm text-gray-600">Sessions Completed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userProfile.stats.responseRate}%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{userProfile.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
          {isEditing ? (
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell others about yourself..."
            />
          ) : (
            <p className="text-gray-700">{userProfile.bio || 'No bio added yet.'}</p>
          )}
        </div>

        {/* Active Posts */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Posts</h2>
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{userProfile.stats.activePosts}</div>
            <div className="text-sm text-gray-500 mt-1">Active learning posts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;