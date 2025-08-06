import { useState } from 'react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Smith',
    email: 'js123@cornell.edu',
    bio: 'CS major passionate about algorithms and machine learning. Always happy to help with programming questions!',
    canTeach: ['Data Structures', 'Algorithms', 'Python', 'Web Development'],
    wantsToLearn: ['Machine Learning', 'System Design', 'Career Advice'],
    rating: 4.8,
    completedSessions: 12,
    responseRate: 95
  });

  const handleSave = () => {
    // TODO: Save profile changes
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-blue-600">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-gray-600">{profile.email}</p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-medium text-gray-900 ml-1">{profile.rating}</span>
                  <span className="text-sm text-gray-500 ml-2">({profile.completedSessions} sessions)</span>
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
              <div className="text-2xl font-bold text-blue-600">{profile.completedSessions}</div>
              <div className="text-sm text-gray-600">Sessions Completed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{profile.responseRate}%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{profile.rating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell others about yourself..."
            />
          ) : (
            <p className="text-gray-700">{profile.bio}</p>
          )}
        </div>

        {/* Can Teach */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">I Can Teach</h2>
          <div className="flex flex-wrap gap-2">
            {profile.canTeach.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
            {isEditing && (
              <button className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 text-sm rounded-full hover:border-gray-400">
                + Add Skill
              </button>
            )}
          </div>
        </div>

        {/* Wants to Learn */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">I Want to Learn</h2>
          <div className="flex flex-wrap gap-2">
            {profile.wantsToLearn.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {topic}
              </span>
            ))}
            {isEditing && (
              <button className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 text-sm rounded-full hover:border-gray-400">
                + Add Topic
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;