import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePost } from '../hooks/usePosts';
import type { CreatePostData } from '../services/postService';

const CreatePost = () => {
  const navigate = useNavigate();
  const createPostMutation = useCreatePost();
  
  const [formData, setFormData] = useState<CreatePostData>({
    title: '',
    description: '',
    type: 'LEARN',
    category: 'COURSEWORK',
    subject: '',
    courseCode: '',
    tags: [],
    availability: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [availabilityDay, setAvailabilityDay] = useState('Monday');
  const [availabilityTime, setAvailabilityTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length > 100) {
      newErrors.subject = 'Subject must be less than 100 characters';
    }

    if (formData.courseCode && formData.courseCode.length > 20) {
      newErrors.courseCode = 'Course code must be less than 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        courseCode: formData.courseCode?.trim() || undefined,
        tags: formData.tags || [],
        availability: formData.availability || []
      };
      
      await createPostMutation.mutateAsync(submitData);
      navigate('/posts');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleInputChange = (field: keyof CreatePostData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    const tag = currentTag.trim();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addAvailability = () => {
    const timeSlot = availabilityTime.trim();
    if (timeSlot) {
      const newSlot = { day: availabilityDay, timeSlot };
      const exists = formData.availability?.some(
        slot => slot.day === newSlot.day && slot.timeSlot === newSlot.timeSlot
      );
      
      if (!exists) {
        setFormData(prev => ({
          ...prev,
          availability: [...(prev.availability || []), newSlot]
        }));
        setAvailabilityTime('');
      }
    }
  };

  const removeAvailability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Post</h1>
        <p className="text-gray-600">Share what you can teach or ask for help learning something new</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
        {/* Post Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Post Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleInputChange('type', 'LEARN')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                formData.type === 'LEARN'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">Teach Me</div>
              <div className="text-sm text-gray-500">I want to learn something</div>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('type', 'TEACH')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                formData.type === 'TEACH'
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">I Can Teach</div>
              <div className="text-sm text-gray-500">I can help others learn</div>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g. Help with Linear Algebra concepts"
            maxLength={200}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe what you want to learn or what you can teach..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as 'CAREER' | 'COURSEWORK' | 'HOBBIES')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="COURSEWORK">Coursework</option>
              <option value="CAREER">Career</option>
              <option value="HOBBIES">Hobbies</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.subject ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g. Mathematics, Computer Science, Guitar"
              maxLength={100}
            />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
          </div>
        </div>

        {/* Course Code */}
        <div>
          <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-2">
            Course Code (Optional)
          </label>
          <input
            type="text"
            id="courseCode"
            value={formData.courseCode}
            onChange={(e) => handleInputChange('courseCode', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.courseCode ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g. CS 2110, MATH 1920"
            maxLength={20}
          />
          {errors.courseCode && <p className="mt-1 text-sm text-red-600">{errors.courseCode}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a tag (e.g. beginner, advanced, exam-prep)"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Add
            </button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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
          )}
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability (Optional)</label>
          <div className="flex gap-2 mb-2">
            <select
              value={availabilityDay}
              onChange={(e) => setAvailabilityDay(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
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
              value={availabilityTime}
              onChange={(e) => setAvailabilityTime(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Error Display */}
        {createPostMutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Failed to create post. Please check your information and try again.
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createPostMutation.isPending}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
              createPostMutation.isPending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;