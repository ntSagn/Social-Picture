import React from 'react';
import { getImageUrl } from '../../../utils/imageUtils';
import defaultAvatar from '../../../assets/default-avatar.png';

const FollowersTab = ({ followers, navigate }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Followers</h3>
      {followers.length > 0 ? (
        <div className="space-y-4">
          {followers.map((follower) => (
            <div 
              key={follower.userId} 
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={getImageUrl(follower.profilePicture) || defaultAvatar}
                  alt={follower.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <span className="font-medium">{follower.username}</span>
              </div>
              <button
                onClick={() => navigate(`/profile/${follower.userId}`)}
                className="px-4 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-100"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">You don't have any followers yet.</p>
      )}
    </div>
  );
};

export default FollowersTab;