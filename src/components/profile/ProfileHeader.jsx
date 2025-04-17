import React from 'react';
import { Edit, Camera, Users, UserPlus } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import defaultAvatar from '../../assets/default-avatar.png';

const ProfileHeader = ({ 
  userInfo, 
  stats, 
  isCurrentUser, 
  isEditing, 
  followStatus, 
  handleInputChange, 
  handleImageUpload, 
  handleSaveChanges, 
  setActiveTab,
  setIsEditing, 
  handleFollowToggle 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
        {/* Profile Picture */}
        <div className="relative">
          <img
            src={userInfo.profilePicturePreview || getImageUrl(userInfo.profilePicture) || defaultAvatar}
            alt={userInfo.username}
            className="h-32 w-32 rounded-full object-cover"
          />
          {isCurrentUser && isEditing && (
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer">
              <Camera size={20} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          {isCurrentUser && isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userInfo.username}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-gray-100"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={userInfo.fullname}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  value={userInfo.bio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                ></textarea>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{userInfo.fullname}</h2>
                  <p className="text-gray-600">{userInfo.username}</p>
                  {isCurrentUser && <p className="text-gray-600">{userInfo.email}</p>}
                  {userInfo.bio && <p className="text-gray-800 mt-2">{userInfo.bio}</p>}
                </div>
                {isCurrentUser ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
                  >
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    className={`px-4 py-2 rounded-lg ${
                      followStatus 
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {followStatus ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              <div className="flex space-x-6 mt-4">
                <div className="flex items-center text-gray-700">
                  <Users size={16} className="mr-1" />
                  <span>{stats.followersCount} Followers</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <UserPlus size={16} className="mr-1" />
                  <span>{stats.followingCount} Following</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;