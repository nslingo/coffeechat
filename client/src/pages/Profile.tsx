import { useState, useEffect } from 'react';
import { useUserProfile, useUpdateProfile } from '../hooks/useUser';
import { useMyPosts } from '../hooks/usePosts';
import ReviewsList from '../components/ReviewsList';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { data: userProfile, isLoading, error } = useUserProfile();
  const { data: myPosts } = useMyPosts();
  const updateProfileMutation = useUpdateProfile();

  const [editForm, setEditForm] = useState({
    bio: '',
    image: '',
  });

  // Initialize form when userProfile loads
  useEffect(() => {
    if (userProfile && !isEditing) {
      setEditForm({
        bio: userProfile.bio || '',
        image: userProfile.image || '',
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
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
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
              <div className="text-2xl font-bold text-blue-600">{userProfile.stats.activePosts}</div>
              <div className="text-sm text-gray-600">Active Posts</div>
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Posts</h2>
            <button
              onClick={() => navigate('/posts/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Create Post
            </button>
          </div>
          
          {myPosts && myPosts.posts.length > 0 ? (
            <div className="space-y-4">
              {myPosts.posts.map((post) => (
                <div key={post.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          post.type === 'TEACH' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {post.type === 'TEACH' ? 'I Can Teach' : 'Teach Me'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          {post.category.charAt(0) + post.category.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <h3 
                        onClick={() => navigate(`/posts/${post.id}`)}
                        className="text-base font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                      >
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{post.subject}</span>
                        {post.courseCode && <span>{post.courseCode}</span>}
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/posts/${post.id}/edit`)}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit post"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">0</div>
              <div className="text-sm text-gray-500 mt-1 mb-4">No posts yet</div>
              <button
                onClick={() => navigate('/posts/create')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Create your first post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-6">
        <ReviewsList userId={userProfile.id} showTitle={true} />
      </div>
    </div>
  );
};

export default Profile;