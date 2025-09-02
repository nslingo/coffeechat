import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import type { User } from '../services/userService';
import ReviewsList from '../components/ReviewsList';
import ReviewModal from '../components/ReviewModal';
import { authClient } from '../lib/auth-client';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewListKey, setReviewListKey] = useState(0); // Force re-render of reviews

  useEffect(() => {
    // If user is viewing their own profile, redirect to /profile
    if (userId && session?.user?.id === userId) {
      navigate('/profile');
      return;
    }
    
    if (userId) {
      loadUser();
    }
  }, [userId, session?.user?.id, navigate]);

  const loadUser = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const userData = await userService.getPublicProfile(userId);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (userId) {
      navigate(`/messages/${userId}`);
    }
  };

  const handleReviewCreated = () => {
    setReviewListKey(prev => prev + 1); // Force re-render reviews
    if (user) {
      loadUser(); // Refresh user data to update rating
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      year: 'numeric',
      month: 'long'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-500 text-lg mb-4">Error</div>
            <p className="text-gray-600 mb-4">{error || 'User not found'}</p>
            <button
              onClick={() => navigate('/browse')}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-500 hover:text-gray-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6">
            <div className="flex-shrink-0 mb-4 sm:mb-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto sm:mx-0"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <span className="text-gray-600 font-medium text-2xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.name}
                  </h1>
                  
                  {user.totalReviews > 0 ? (
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                      {renderStars(user.averageRating)}
                      <span className="text-lg font-semibold text-gray-900">
                        {user.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({user.totalReviews} review{user.totalReviews !== 1 ? 's' : ''})
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-500 mb-2">No reviews yet</div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Member since {formatJoinDate(user.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 sm:mt-0">
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Send Message</span>
                  </button>
                  
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>Write Review</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {user.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">About</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <ReviewsList key={reviewListKey} userId={user.id} showTitle={true} />
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        userId={user.id}
        userName={user.name}
        onReviewCreated={handleReviewCreated}
      />
    </div>
  );
};

export default UserProfile;