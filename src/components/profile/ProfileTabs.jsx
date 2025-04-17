import React from 'react';
import { Grid, Heart, Bookmark, Users, UserPlus, Settings } from 'lucide-react';

const ProfileTabs = ({ activeTab, setActiveTab, isCurrentUser }) => {
  return (
    <div className="flex overflow-x-auto space-x-4 border-b border-gray-200 mb-6">
      <button
        onClick={() => setActiveTab('my-images')}
        className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'my-images' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
      >
        <Grid size={16} className="inline mr-2" /> {isCurrentUser ? 'My Images' : 'Posts'}
      </button>
      
      {isCurrentUser && (
        <>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'liked' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Heart size={16} className="inline mr-2" /> Liked
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'saved' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Bookmark size={16} className="inline mr-2" /> Saved
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'followers' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={16} className="inline mr-2" /> Followers
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'following' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserPlus size={16} className="inline mr-2" /> Following
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'settings' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Settings size={16} className="inline mr-2" /> Settings
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileTabs;