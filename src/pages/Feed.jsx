import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ImageCard from '../components/ImageCard';
import { getCurrentUser } from '../services/auth';

function Feed() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [images, setImages] = useState([]);
  const [likedImages, setLikedImages] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    // Mock data for images
    const mockImages = [
      { id: 1, url: 'https://i.pinimg.com/736x/25/d3/5e/25d35e32569d9797b57ed0bb707dee41.jpg', title: 'Beautiful Sunset', likes: 50, createdAt: '2023-10-01' },
      { id: 2, url: 'https://i.pinimg.com/736x/64/a0/2b/64a02ba010363922593a235e1c31e194.jpg', title: 'Mountain View', likes: 30, createdAt: '2023-10-02' },
      { id: 3, url: 'https://i.pinimg.com/736x/26/53/b2/2653b20371ca8b4b66abf4db327af9c9.jpg', title: 'City Lights', likes: 70, createdAt: '2023-10-03' },
      { id: 4, url: 'https://i.pinimg.com/736x/af/1e/8a/af1e8a1b8e02263d5b247b3640764ec2.jpg', title: 'Forest Path', likes: 20, createdAt: '2023-10-04' },
    ];

    if (activeTab === 'Tất cả') {
      setImages(mockImages);
    } else if (activeTab === 'Mới Nhất') {
      setImages([...mockImages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } else if (activeTab === 'Hot nhất') {
      setImages([...mockImages].sort((a, b) => b.likes - a.likes));
    }
  }, [activeTab]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleLike = (imageId) => {
    setLikedImages((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* Sidebar for logged in users */}
      {user && <Sidebar />}
      
      <div className={`${user ? 'ml-16' : ''} w-full`}>
        {/* Header */}
        <Header
          isSearchPage={true}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Main Content */}
        <main className={`pt-20 px-6 ${user ? 'ml-0' : ''}`}>
          {/* Tabs */}
          <div className="flex justify-center space-x-6 mb-6">
            {['Tất cả', 'Mới Nhất', 'Hot nhất'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full ${
                  activeTab === tab ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Masonry Layout */}
          <div className="columns-2 md:columns-4 gap-4">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isLiked={likedImages.includes(image.id)}
                onLike={toggleLike}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Feed;