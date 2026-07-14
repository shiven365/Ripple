import React, { useState } from 'react';
import { followUser } from '../api/users';

const FollowButton = ({ userId, onFollowed }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    try {
      setLoading(true);
      await followUser(userId);
      setIsFollowing(true);
      if (onFollowed) onFollowed();
    } catch (error) {
      console.error('Failed to follow user', error);
      alert('Error following user');
    } finally {
      setLoading(false);
    }
  };

  if (isFollowing) {
    return (
      <button disabled className="bg-gray-100 text-gray-600 px-4 py-2 rounded font-medium border border-gray-200">
        Following
      </button>
    );
  }

  return (
    <button 
      onClick={handleFollow} 
      disabled={loading}
      className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
    >
      {loading ? 'Following...' : 'Follow'}
    </button>
  );
};

export default FollowButton;
