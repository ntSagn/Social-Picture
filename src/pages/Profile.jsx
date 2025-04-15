import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Camera, Users, UserPlus, Grid, Bookmark, Settings, Heart } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { imagesService } from '../api/imagesService';
import { followsService } from '../api/followsService';
import { usersService } from '../api/usersService';
import { likesService } from '../api/likesService';
import { savedImagesService } from '../api/savedImagesService';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import defaultAvatar from '../assets/default-avatar.png';

function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-images');
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useAuth();
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    fullname: '', // Add this field
    bio: '',
    profilePicture: ''
  });

  const [profileImages, setProfileImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [likedImages, setLikedImages] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    imagesCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Fetch user profile data
        const userResponse = await usersService.getCurrentUser();
        const userData = userResponse.data;

        setUserInfo({
          username: userData.username,
          email: userData.email,
          fullname: userData.fullname || '', // Add this field
          bio: userData.bio || '',
          profilePicture: userData.profilePicture
        });

        // Initialize stats with data from user response if available
        setStats({
          imagesCount: userData.postsCount || 0,
          followersCount: userData.followersCount || 0,
          followingCount: userData.followingCount || 0
        });

        // Fetch user's images using the filter by userId parameter
        try {
          const imagesResponse = await imagesService.getAll({
            userId: userData.userId,
            publicOnly: false, // Get both public and private images for the user
            page: 1,
            pageSize: 50 // Adjust as needed
          });

          setProfileImages(imagesResponse.data);

          // Update stats if not available from user data
          if (!stats.imagesCount) {
            setStats(prev => ({ ...prev, imagesCount: imagesResponse.data.length }));
          }
        } catch (imagesError) {
          console.error('Error fetching user images:', imagesError);
          setProfileImages([]);
        }

        // Fetch saved images if there's an endpoint for this
        try {
          const savedResponse = await savedImagesService.getCurrentUserSaved();
          setSavedImages(savedResponse.data || []);
        } catch (savedError) {
          console.error('Error fetching saved images:', savedError);
          setSavedImages([]);
        }

        // Fetch liked images from the likes service
        try {
          // First get all likes by this user, then get the images
          const likedImageIds = await likesService.getUserLikedImages(userData.userId);
          if (likedImageIds && likedImageIds.data) {
            // If the API returns image details directly, use that
            setLikedImages(likedImageIds.data);
          } else {
            // Otherwise, set empty array
            setLikedImages([]);
          }
        } catch (likedError) {
          console.error('Error fetching liked images:', likedError);
          setLikedImages([]);
        }

        // Fetch followers
        try {
          const followersResponse = await followsService.getFollowers(userData.userId);
          setFollowers(followersResponse.data || []);

          // Update stats if needed
          if (!stats.followersCount) {
            setStats(prev => ({ ...prev, followersCount: followersResponse.data?.length || 0 }));
          }
        } catch (followersError) {
          console.error('Error fetching followers:', followersError);
          setFollowers([]);
        }

        // Fetch following
        try {
          const followingResponse = await followsService.getFollowing(userData.userId);
          setFollowing(followingResponse.data || []);

          // Update stats if needed
          if (!stats.followingCount) {
            setStats(prev => ({ ...prev, followingCount: followingResponse.data?.length || 0 }));
          }
        } catch (followingError) {
          console.error('Error fetching following users:', followingError);
          setFollowing([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = "${value}"`);
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Create a FileReader to preview the image
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserInfo({
          ...userInfo,
          profilePictureFile: e.target.files[0], // Store the file object for later use
          profilePicturePreview: event.target.result // Create a preview URL
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Show loading state
      setIsLoading(true);

      // First, if there's a new profile picture file, upload it
      let profilePicturePath = userInfo.profilePicture;

      if (userInfo.profilePictureFile) {
        // Create a FormData object for the image upload
        const imageFormData = new FormData();
        imageFormData.append('imageFile', userInfo.profilePictureFile);
        imageFormData.append('Caption', 'Update Avatar');
        imageFormData.append('IsPublic', false);

        // Upload the image using the Images API
        try {
          const imageResponse = await imagesService.create(imageFormData);

          // Extract the imageUrl from the response
          if (imageResponse && imageResponse.data && imageResponse.data.imageUrl) {
            profilePicturePath = imageResponse.data.imageUrl;
          }
        } catch (imageError) {
          console.error('Error uploading profile picture:', imageError);
          // Continue with profile update even if image upload fails
        }
      }

      // Now update the user profile with all data including the new image path if uploaded
      const updatedUserData = {};

      // Only include fields that have values to avoid sending undefined or empty values
      if (userInfo.fullname) updatedUserData.fullname = userInfo.fullname;
      if (userInfo.bio !== undefined) updatedUserData.bio = userInfo.bio; // Include empty string
      if (profilePicturePath) updatedUserData.profilePicture = profilePicturePath;

      console.log('Updating profile with data:', updatedUserData);

      // Call the update API
      const updateResponse = await usersService.update(currentUser.userId, updatedUserData);
      console.log('Update API response:', updateResponse);

      // Clear the preview URL and file selection
      if (userInfo.profilePicturePreview) {
        URL.revokeObjectURL(userInfo.profilePicturePreview);
        setUserInfo(prev => ({
          ...prev,
          profilePictureFile: null,
          profilePicturePreview: null
        }));
      }

      // Exit editing mode
      setIsEditing(false);

      // Refresh the user data to show updated information
      const refreshUserResponse = await usersService.getCurrentUser();
      const refreshedUserData = refreshUserResponse.data;
      console.log('Refreshed user data:', refreshedUserData);

      setUserInfo({
        username: refreshedUserData.username,
        email: refreshedUserData.email,
        fullname: refreshedUserData.fullname || '',
        bio: refreshedUserData.bio || '',
        profilePicture: refreshedUserData.profilePicture
      });

      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle image upload from the avatar edit button
  const handleImageUpload = (e) => {
    handleFileInputChange(e);
  };

  const handleImageClick = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  const handleUnfollow = async (userId) => {
    try {
      await followsService.unfollow(userId);

      // Update following list by removing the unfollowed user
      setFollowing(following.filter(user => user.userId !== userId));

      // Update stats
      setStats(prev => ({
        ...prev,
        followingCount: prev.followingCount - 1
      }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('Failed to unfollow user. Please try again.');
    }
  };

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex">
        <Sidebar />
        <div className="ml-16 w-full">
          <Header />
          <main className="pt-20 px-6 py-8">
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Sidebar />
      <div className="ml-16 w-full">
        <Header />
        <main className="pt-20 px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                {/* Profile Picture */}
                <div className="relative">
                  <img
                    src={userInfo.profilePicturePreview || getImageUrl(userInfo.profilePicture) || defaultAvatar}
                    alt={userInfo.username}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                  {isEditing && (
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
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={userInfo.username}
                          readOnly // Username cannot be changed
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
                          readOnly // Email cannot be changed in this basic form
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-gray-100"
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
                          value={userInfo.Bio}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        ></textarea>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            console.log('Current userInfo before saving:', userInfo);
                            handleSaveChanges();
                          }}
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
                          <p className="text-gray-600">{userInfo.email}</p>
                          {/* {userInfo.fullname && <p className="text-gray-800">{userInfo.username}</p>} */}
                          {userInfo.bio && <p className="text-gray-800 mt-2">{userInfo.bio}</p>}
                        </div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
                        >
                          <Edit size={16} />
                          <span>Edit Profile</span>
                        </button>
                      </div>
                      <div className="flex space-x-6 mt-4">
                        <button
                          onClick={() => setActiveTab('followers')}
                          className="flex items-center text-gray-700"
                        >
                          <Users size={16} className="mr-1" />
                          <span>{stats.followersCount} Followers</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('following')}
                          className="flex items-center text-gray-700"
                        >
                          <UserPlus size={16} className="mr-1" />
                          <span>{stats.followingCount} Following</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto space-x-4 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('my-images')}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'my-images' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid size={16} className="inline mr-2" /> My Images
              </button>
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
            </div>

            {/* Content based on active tab */}
            <div className="mt-6">
              {/* My Images */}
              {activeTab === 'my-images' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">My Images</h3>
                  {profileImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {profileImages.map((image) => (
                        <div
                          key={image.imageId}
                          className="relative group cursor-pointer"
                          onClick={() => handleImageClick(image.imageId)}
                        >
                          <img
                            src={getImageUrl(image.imageUrl)}
                            alt={image.caption || 'Image'}
                            className="w-full aspect-square object-cover rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <h4 className="text-white text-center font-medium px-2">{image.caption || 'No caption'}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">You haven't uploaded any images yet.</p>
                  )}
                </div>
              )}

              {/* Liked Images */}
              {activeTab === 'liked' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Liked Images</h3>
                  {likedImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {likedImages.map((image) => (
                        <div
                          key={image.imageId}
                          className="relative group cursor-pointer"
                          onClick={() => handleImageClick(image.imageId)}
                        >
                          <img
                            src={getImageUrl(image.imageUrl)}
                            alt={image.caption || 'Image'}
                            className="w-full aspect-square object-cover rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <h4 className="text-white text-center font-medium px-2">{image.caption || 'No caption'}</h4>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Heart size={20} fill="#ef4444" color="#ef4444" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">You haven't liked any images yet.</p>
                  )}
                </div>
              )}

              {/* Saved Images */}
              {activeTab === 'saved' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Saved Images</h3>
                  {savedImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {savedImages.map((image) => (
                        <div
                          key={image.imageId}
                          className="relative group cursor-pointer"
                          onClick={() => handleImageClick(image.imageId)}
                        >
                          <img
                            src={getImageUrl(image.imageUrl)}
                            alt={image.caption || 'Image'}
                            className="w-full aspect-square object-cover rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <h4 className="text-white text-center font-medium px-2">{image.caption || 'No caption'}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">You haven't saved any images yet.</p>
                  )}
                </div>
              )}

              {/* Followers */}
              {activeTab === 'followers' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Followers</h3>
                  {followers.length > 0 ? (
                    <div className="space-y-4">
                      {followers.map((follower) => (
                        <div key={follower.userId} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
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
              )}

              {/* Following */}
              {activeTab === 'following' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Following</h3>
                  {following.length > 0 ? (
                    <div className="space-y-4">
                      {following.map((follow) => (
                        <div key={follow.userId} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getImageUrl(follow.profilePicture) || defaultAvatar}
                              alt={follow.username}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <span className="font-medium">{follow.username}</span>
                          </div>
                          <button
                            onClick={() => handleUnfollow(follow.userId)}
                            className="px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200"
                          >
                            Unfollow
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">You're not following anyone yet.</p>
                  )}
                </div>
              )}

              {/* Settings */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold mb-6">Account Settings</h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium mb-2">Privacy</h4>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-700">Make my profile private</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">Notifications</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-700">Email notifications</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-700">Push notifications</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2">Security</h4>
                      <button
                        onClick={() => {
                          console.log('Change password clicked');
                          // In a real app, you would open a password change modal or navigate to a password change page
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          console.log('Deactivate account clicked');
                          // In a real app, you would show a confirmation dialog and then call an API
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Deactivate Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;