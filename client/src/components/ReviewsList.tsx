import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import type { Review, RatingDistribution } from '../services/reviewService';

interface ReviewsListProps {
  userId: string;
  showTitle?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ userId, showTitle = true }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReviews();
  }, [userId, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getUserReviews(userId, currentPage, 10);
      setReviews(data.reviews);
      setRatingDistribution(data.ratingDistribution);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const averageRating = ratingDistribution.reduce(
    (sum, dist) => sum + (dist.rating * dist.count),
    0
  ) / ratingDistribution.reduce((sum, dist) => sum + dist.count, 0);

  const totalReviews = ratingDistribution.reduce((sum, dist) => sum + dist.count, 0);

  if (loading && currentPage === 1) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="text-red-500 text-lg mb-2">Error</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {showTitle && (
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews & Ratings</h2>
          
          {totalReviews > 0 ? (
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mt-1">
                  {renderStars(Math.round(averageRating))}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="flex-1">
                {ratingDistribution.sort((a, b) => b.rating - a.rating).map((dist) => (
                  <div key={dist.rating} className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-600 w-6">{dist.rating}</span>
                    <span className="text-yellow-400">★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${totalReviews > 0 ? (dist.count / totalReviews) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{dist.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 text-4xl mb-2">⭐</div>
              <p className="text-gray-500">No reviews yet</p>
            </div>
          )}
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {reviews.length === 0 ? (
          !showTitle && (
            <div className="p-6 text-center">
              <p className="text-gray-500">No reviews available</p>
            </div>
          )
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {review.reviewer.image ? (
                    <img
                      src={review.reviewer.image}
                      alt={review.reviewer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {review.reviewer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {review.reviewer.name}
                    </h4>
                    <time className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </time>
                  </div>
                  <div className="mt-1">
                    {renderStars(review.rating)}
                  </div>
                  {review.feedback && (
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                      {review.feedback}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;