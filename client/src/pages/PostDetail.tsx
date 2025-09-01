import { useParams, useNavigate } from 'react-router-dom';
import { usePost } from '../hooks/usePosts';
import { authClient } from '../lib/auth-client';

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const { data: post, isLoading, error } = usePost(postId!);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Post Not Found</h2>
          <p className="text-red-600 mb-4">The post you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/posts')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSendMessage = () => {
    // Navigate to conversation with the post author
    navigate(`/messages/${post.author.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/posts')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Posts
      </button>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                post.type === 'TEACH' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {post.type === 'TEACH' ? 'I Can Teach' : 'Teach Me'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {post.category.charAt(0) + post.category.slice(1).toLowerCase()}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Posted {formatDate(post.createdAt)}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {post.subject}
            </div>
            {post.courseCode && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {post.courseCode}
              </div>
            )}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
              </svg>
              Available for chat
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 p-8">
          {/* Left Column - Post Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{post.description}</p>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {post.availability && post.availability.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {post.availability.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-lg px-4 py-2 text-sm"
                      >
                        <span className="font-medium text-gray-900">{slot.day}</span>
                        <span className="text-gray-600">{slot.timeSlot}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Author & Actions */}
          <div className="space-y-6">
            {/* Author Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {post.author.profilePicture ? (
                    <img
                      src={post.author.profilePicture}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-gray-700">
                      {post.author.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    {post.author.averageRating > 0 ? (
                      <>
                        <span className="text-yellow-500 mr-1">⭐</span>
                        <span>{post.author.averageRating.toFixed(1)}</span>
                        {post.author.totalReviews > 0 && (
                          <span className="ml-1">({post.author.totalReviews} review{post.author.totalReviews !== 1 ? 's' : ''})</span>
                        )}
                      </>
                    ) : (
                      <span>New user</span>
                    )}
                  </div>
                </div>
              </div>

              {post.author.bio && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">{post.author.bio}</p>
                </div>
              )}

              {/* Action Buttons */}
              {session?.user?.id !== post.author.id ? (
                <div className="space-y-3">
                  <button 
                    onClick={handleSendMessage}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Send Message
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/users/${post.author.id}`)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate(`/posts/${post.id}/edit`)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Post
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                Connect with {post.author.name} to coordinate your learning session!
              </div>
            </div>

            {/* Post Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Post Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="text-gray-900">{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last updated</span>
                  <span className="text-gray-900">{formatDate(post.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PostDetail;