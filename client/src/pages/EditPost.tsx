import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePost, useUpdatePost, useDeletePost } from '../hooks/usePosts';
import type { UpdatePostData } from '../services/postService';

const EditPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = usePost(postId!);
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  const [formData, setFormData] = useState<UpdatePostData>({
    title: '',
    description: '',
    type: 'TEACH',
    category: 'COURSEWORK',
    subject: '',
    courseCode: '',
    tags: [],
    availability: []
  });
  const [tagInput, setTagInput] = useState('');
  const [availabilityForm, setAvailabilityForm] = useState({ day: '', timeSlot: '' });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        description: post.description,
        type: post.type,
        category: post.category,
        subject: post.subject,
        courseCode: post.courseCode || '',
        tags: post.tags || [],
        availability: post.availability || []
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return;

    try {
      await updatePostMutation.mutateAsync({ postId, data: formData });
      navigate(`/posts/${postId}`);
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const handleDelete = async () => {
    if (!postId || !confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      await deletePostMutation.mutateAsync(postId);
      navigate('/profile');
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addAvailability = () => {
    if (availabilityForm.day && availabilityForm.timeSlot) {
      const exists = formData.availability.some(
        slot => slot.day === availabilityForm.day && slot.timeSlot === availabilityForm.timeSlot
      );
      
      if (!exists) {
        setFormData(prev => ({
          ...prev,
          availability: [...prev.availability, { ...availabilityForm }]
        }));
        setAvailabilityForm({ day: '', timeSlot: '' });
      }
    }
  };

  const removeAvailability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 text-lg mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error || 'Post not found'}</p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
              <p className="text-gray-600 mt-1">Update your learning post details</p>
            </div>
            <button
              onClick={() => navigate(`/posts/${postId}`)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="type"
                  value="TEACH"
                  checked={formData.type === 'TEACH'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'TEACH' | 'LEARN' })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">I Can Teach</div>
                  <div className="text-sm text-gray-600">Share your knowledge with others</div>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="type"
                  value="LEARN"
                  checked={formData.type === 'LEARN'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'TEACH' | 'LEARN' })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Teach Me</div>
                  <div className="text-sm text-gray-600">Find someone to learn from</div>
                </div>
              </label>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as 'CAREER' | 'COURSEWORK' | 'HOBBIES' })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="COURSEWORK">Coursework</option>
              <option value="CAREER">Career</option>
              <option value="HOBBIES">Hobbies</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="What do you want to teach or learn?"
              required
            />
          </div>

          {/* Subject and Course Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Computer Science, Mathematics"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
              <input
                type="text"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., CS 2110, MATH 1920"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Describe what you want to teach or learn..."
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability (Optional)</label>
            <div className="flex gap-2 mb-2">
              <select
                value={availabilityForm.day}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, day: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              <input
                type="text"
                value={availabilityForm.timeSlot}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, timeSlot: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g. Morning, Evening, 2-4pm, After 6pm"
              />
              <button
                type="button"
                onClick={addAvailability}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.availability && formData.availability.length > 0 && (
              <div className="space-y-2">
                {formData.availability.map((slot, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm mr-2 mb-2"
                  >
                    <span>{slot.day}: {slot.timeSlot}</span>
                    <button
                      type="button"
                      onClick={() => removeAvailability(index)}
                      className="ml-2 text-gray-600 hover:text-gray-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePostMutation.isPending}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              {deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/posts/${postId}`)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatePostMutation.isPending}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
              >
                {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;