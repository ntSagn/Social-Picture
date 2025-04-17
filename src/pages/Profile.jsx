import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { imagesService } from '../api/imagesService';
import { followsService } from '../api/followsService';
import { usersService } from '../api/usersService';
import { likesService } from '../api/likesService';
import { savedImagesService } from '../api/savedImagesService';
import { useAuth } from '../contexts/AuthContext';

// Import profile components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import MyImagesTab from '../components/profile/tabs/MyImagesTab';
import LikedImagesTab from '../components/profile/tabs/LikedImagesTab';
import SavedImagesTab from '../components/profile/tabs/SavedImagesTab';
import FollowersTab from '../components/profile/tabs/FollowersTab';
import FollowingTab from '../components/profile/tabs/FollowingTab';
import SettingsTab from '../components/profile/tabs/SettingsTab';

function Profile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('my-images');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    fullname: '',
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
  const [isCurrentUser, setIsCurrentUser] = useState(true);
  const [followStatus, setFollowStatus] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Check if viewing own profile or another user's profile
        const isViewingSelf = !userId || userId === currentUser.userId.toString();
        setIsCurrentUser(isViewingSelf);
        
        let userData;
        
        if (isViewingSelf) {
          // Get current user data
          const userResponse = await usersService.getCurrentUser();
          userData = userResponse.data;
        } else {
          // Get other user data
          const userResponse = await usersService.getById(userId);
          userData = userResponse.data;
          
          // Check if current user is following this user
          try {
            const followResponse = await followsService.checkFollowing(userId);
            setFollowStatus(followResponse.data || false);
          } catch (err) {
            console.error("Error checking follow status:", err);
            setFollowStatus(false);
          }
        }

        // Set user info - only include email if viewing own profile
        setUserInfo({
          userId: userData.userId,
          username: userData.username,
          email: isViewingSelf ? (userData.email || '') : '', // Only include email for own profile
          fullname: userData.fullname || '',
          bio: userData.bio || '',
          profilePicture: userData.profilePicture
        });

        // Set stats
        setStats({
          imagesCount: userData.postsCount || 0,
          followersCount: userData.followersCount || 0,
          followingCount: userData.followingCount || 0
        });

        // Fetch user's images
        try {
          const imagesResponse = await imagesService.getAll({
            userId: userData.userId,
            publicOnly: !isViewingSelf, // Only get public images for other users
            page: 1,
            pageSize: 50
          });

          setProfileImages(imagesResponse.data);
        } catch (imagesError) {
          console.error('Error fetching user images:', imagesError);
          setProfileImages([]);
        }

        // For current user only - fetch additional data
        if (isViewingSelf) {
          // Fetch saved images
          try {
            const savedResponse = await savedImagesService.getCurrentUserSaved();
            setSavedImages(savedResponse.data || []);
          } catch (savedError) {
            console.error('Error fetching saved images:', savedError);
            setSavedImages([]);
          }

          // Fetch liked images
          try {
            const likedResponse = await likesService.getUserLikedImages(currentUser.userId);
            setLikedImages(likedResponse.data || []);
          } catch (likedError) {
            console.error('Error fetching liked images:', likedError);
            setLikedImages([]);
          }

          // Fetch followers
          try {
            const followersResponse = await followsService.getFollowers(userData.userId);
            setFollowers(followersResponse.data || []);
          } catch (followersError) {
            console.error('Error fetching followers:', followersError);
            setFollowers([]);
          }

          // Fetch following
          try {
            const followingResponse = await followsService.getFollowing(userData.userId);
            setFollowing(followingResponse.data || []);
          } catch (followingError) {
            console.error('Error fetching following users:', followingError);
            setFollowing([]);
          }
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
  }, [currentUser, userId, navigate]);

  const handleFollowToggle = async () => {
    if (!userInfo.userId) return;
    
    try {
      if (followStatus) {
        // Unfollow user
        await followsService.unfollow(userInfo.userId);
        setFollowStatus(false);
        setStats(prev => ({
          ...prev,
          followersCount: Math.max(0, prev.followersCount - 1)
        }));
      } else {
        // Follow user
        await followsService.follow(userInfo.userId);
        setFollowStatus(true);
        setStats(prev => ({
          ...prev,
          followersCount: prev.followersCount + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      setError('Failed to update follow status. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setProfilePictureFile(file);
    
    // Create a preview URL
    const previewURL = URL.createObjectURL(file);
    setProfilePicturePreview(previewURL);
    
    // Update userInfo with the preview URL
    setUserInfo(prev => ({
      ...prev,
      profilePicturePreview: previewURL
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update user profile info
      const formData = new FormData();
      formData.append('fullname', userInfo.fullname);
      formData.append('bio', userInfo.bio);
      formData.append('email', userInfo.email);
      
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }
      
      const response = await usersService.updateProfile(formData);
      
      if (response.status === 200 || response.status === 201) {
        // Update local state with the response data
        setUserInfo(prev => ({
          ...prev,
          ...response.data,
          profilePicturePreview: null
        }));
        
        // Revoke any object URLs to prevent memory leaks
        if (profilePicturePreview) {
          URL.revokeObjectURL(profilePicturePreview);
        }
        
        // Reset file state
        setProfilePictureFile(null);
        setProfilePicturePreview(null);
        
        // Exit editing mode
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile changes:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    handleFileInputChange(e);
  };

  const handleImageClick = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  const handleUnfollow = async (unfollowUserId) => {
    try {
      await followsService.unfollow(unfollowUserId);
      
      // Update the following list
      setFollowing(prev => prev.filter(user => user.userId !== unfollowUserId));
      
      // Update following count
      setStats(prev => ({
        ...prev,
        followingCount: Math.max(0, prev.followingCount - 1)
      }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
      setError('Failed to unfollow user. Please try again.');
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

            {/* Use ProfileHeader component */}
            <ProfileHeader 
              userInfo={userInfo}
              stats={stats}
              isCurrentUser={isCurrentUser}
              isEditing={isEditing}
              followStatus={followStatus}
              handleInputChange={handleInputChange}
              handleImageUpload={handleImageUpload}
              handleSaveChanges={handleSaveChanges}
              setActiveTab={setActiveTab}
              setIsEditing={setIsEditing}
              handleFollowToggle={handleFollowToggle}
              profilePicturePreview={profilePicturePreview}
            />

            {/* Only show tabs for own profile */}
            {isCurrentUser && (
              <ProfileTabs 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isCurrentUser={isCurrentUser} 
              />
            )}

            {/* Content based on active tab */}
            <div className="mt-6">
              {/* Always show images tab for both own and other users */}
              {activeTab === 'my-images' && (
                <MyImagesTab 
                  images={profileImages}
                  handleImageClick={handleImageClick}
                  isCurrentUser={isCurrentUser}
                />
              )}

              {/* These tabs are only visible for own profile */}
              {isCurrentUser && activeTab === 'liked' && (
                <LikedImagesTab 
                  images={likedImages}
                  handleImageClick={handleImageClick}
                />
              )}

              {isCurrentUser && activeTab === 'saved' && (
                <SavedImagesTab 
                  images={savedImages}
                  handleImageClick={handleImageClick}
                />
              )}

              {isCurrentUser && activeTab === 'followers' && (
                <FollowersTab 
                  followers={followers}
                  navigate={navigate}
                />
              )}

              {isCurrentUser && activeTab === 'following' && (
                <FollowingTab 
                  following={following}
                  handleUnfollow={handleUnfollow}
                />
              )}

              {isCurrentUser && activeTab === 'settings' && (
                <SettingsTab 
                  setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}
                />
              )}
            </div>

            {/* Only show change password modal for own profile */}
            {isCurrentUser && (
              <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;