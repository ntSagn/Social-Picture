import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Camera, Users, UserPlus, Grid, Bookmark, Settings, Heart } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getCurrentUser } from '../services/auth';

function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-images');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [userInfo, setUserInfo] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || 'https://i.pravatar.cc/150?img=1'
  });
  const [profileImages, setProfileImages] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [likedImages, setLikedImages] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Mock data for user's images
    const mockImages = [
      { id: 1, url: 'https://i.pinimg.com/736x/25/d3/5e/25d35e32569d9797b57ed0bb707dee41.jpg', title: 'Beautiful Sunset', likes: 50 },
      { id: 2, url: 'https://i.pinimg.com/736x/64/a0/2b/64a02ba010363922593a235e1c31e194.jpg', title: 'Mountain View', likes: 30 },
      { id: 3, url: 'https://i.pinimg.com/736x/26/53/b2/2653b20371ca8b4b66abf4db327af9c9.jpg', title: 'City Lights', likes: 70 }
    ];
    setProfileImages(mockImages);
    
    // Mock data for saved images
    const mockSavedImages = [
      { id: 4, url: 'https://i.pinimg.com/736x/af/1e/8a/af1e8a1b8e02263d5b247b3640764ec2.jpg', title: 'Forest Path', likes: 20 },
      { id: 5, url: 'https://i.pinimg.com/736x/de/3a/94/de3a9491bbdd5aeecd615ff43693236a.jpg', title: 'Beach Sunset', likes: 45 }
    ];
    setSavedImages(mockSavedImages);
    
    // Mock data for liked images
    const mockLikedImages = [
      { id: 6, url: 'https://i.pinimg.com/736x/ce/4b/78/ce4b78b179e87aa0c14f7d7053c06a21.jpg', title: 'Ocean View', likes: 85 },
      { id: 7, url: 'https://i.pinimg.com/736x/af/1e/8a/af1e8a1b8e02263d5b247b3640764ec2.jpg', title: 'Forest Trail', likes: 62 },
      { id: 8, url: 'https://i.pinimg.com/736x/25/d3/5e/25d35e32569d9797b57ed0bb707dee41.jpg', title: 'Mountain Lake', likes: 74 }
    ];
    setLikedImages(mockLikedImages);
    
    // Mock followers data
    const mockFollowers = [
      { id: 11, username: 'john_doe', profilePicture: 'https://i.pravatar.cc/150?img=11' },
      { id: 12, username: 'nature_lover', profilePicture: 'https://i.pravatar.cc/150?img=12' },
      { id: 13, username: 'travel_explorer', profilePicture: 'https://i.pravatar.cc/150?img=13' }
    ];
    setFollowers(mockFollowers);
    
    // Mock following data
    const mockFollowing = [
      { id: 21, username: 'art_enthusiast', profilePicture: 'https://i.pravatar.cc/150?img=21' },
      { id: 22, username: 'photography_pro', profilePicture: 'https://i.pravatar.cc/150?img=22' }
    ];
    setFollowing(mockFollowing);
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      setUserInfo({ ...userInfo, profilePicture: imageUrl });
    }
  };

  const handleSaveChanges = () => {
    // In a real app, you would make an API call to update the user info
    // For now, we'll just update the local state
    const updatedUser = { ...user, ...userInfo };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleImageClick = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Sidebar />
      <div className="ml-16 w-full">
        <Header />
        <main className="pt-20 px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                {/* Profile Picture */}
                <div className="relative">
                  <img 
                    src={userInfo.profilePicture} 
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
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
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
                          <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                          <p className="text-gray-600">{user.email}</p>
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
                          <span>{followers.length} Followers</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('following')}
                          className="flex items-center text-gray-700"
                        >
                          <UserPlus size={16} className="mr-1" />
                          <span>{following.length} Following</span>
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
                          key={image.id}
                          className="relative group cursor-pointer"
                          onClick={() => handleImageClick(image.id)}
                        >
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full aspect-square object-cover rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <h4 className="text-white text-center font-medium px-2">{image.title}</h4>
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
                          key={image.id}
                          className="relative group cursor-pointer"
                          onClick={() => handleImageClick(image.id)}
                        >
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full aspect-square object-cover rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <h4 className="text-white text-center font-medium px-2">{image.title}</h4>
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
                          key={image.id}
                          className="relative group cursor-pointer"
                          onClick={() => handleImageClick(image.id)}
                        >
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full aspect-square object-cover rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <h4 className="text-white text-center font-medium px-2">{image.title}</h4>
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
                        <div key={follower.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center space-x-4">
                            <img
                              src={follower.profilePicture}
                              alt={follower.username}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <span className="font-medium">{follower.username}</span>
                          </div>
                          <button className="px-4 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-100">
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
                        <div key={follow.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center space-x-4">
                            <img
                              src={follow.profilePicture}
                              alt={follow.username}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <span className="font-medium">{follow.username}</span>
                          </div>
                          <button className="px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200">
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
                      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                        Change Password
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
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