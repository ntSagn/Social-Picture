import React, { useState, useEffect, act } from 'react';
import Masonry from 'react-masonry-css';
import { imagesService } from '../api/imagesService';
import { likesService } from '../api/likesService';
import { searchService } from '../api/searchService';
import Layout from '../components/Layout';
import { getImageUrl } from '../utils/imageUtils';
import { Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Feed = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedImages, setLikedImages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const { currentUser } = useAuth() || { currentUser: null };
  const navigate = useNavigate();

  // Breakpoints for the masonry layout
  const breakpointColumnsObj = {
    default: 5, // Default number of columns
    1280: 4,    // 4 columns at 1280px
    1024: 3,    // 3 columns at 1024px
    768: 2,     // 2 columns at 768px
    640: 1      // 1 column at 640px and below
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Set the active query to trigger search
    setActiveQuery(searchQuery.trim());
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        let response;
        
        if (activeQuery) {
          response = await searchService.searchImages(activeQuery);
        } else {
          response = await imagesService.getAll();
        }
        
        setImages(response.data || []);
        
        // Initialize liked status if user is logged in
        if (currentUser && response.data) {
          const initialLikedState = {};
          response.data.forEach(img => {
            initialLikedState[img.imageId] = img.isLikedByCurrentUser || false;
          });
          setLikedImages(initialLikedState);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [currentUser, activeQuery]);

  const handleLike = async (imageId) => {
    if (!currentUser) {
      // Handle not logged in state
      return;
    }

    try {
      // Toggle like state in UI immediately
      setLikedImages(prev => ({
        ...prev,
        [imageId]: !prev[imageId]
      }));

      // Update the like count in the images array
      setImages(prevImages =>
        prevImages.map(img =>
          img.imageId === imageId
            ? {
              ...img,
              likesCount: likedImages[imageId]
                ? Math.max(0, img.likesCount - 1)
                : img.likesCount + 1,
              isLikedByCurrentUser: !likedImages[imageId]
            }
            : img
        )
      );

      // Call API to like/unlike image
      if (!likedImages[imageId]) {
        await likesService.like(imageId);
      } else {
        await likesService.unlike(imageId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert UI state on error
      setLikedImages(prev => ({
        ...prev,
        [imageId]: !prev[imageId]
      }));

      // Revert the like count in the images array
      setImages(prevImages =>
        prevImages.map(img =>
          img.imageId === imageId
            ? {
              ...img,
              likesCount: likedImages[imageId]
                ? img.likesCount - 1
                : img.likesCount + 1,
              isLikedByCurrentUser: likedImages[imageId]
            }
            : img
        )
      );
    }
  };

  const handleImageClick = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  return (
    <Layout 
      isSearchPage={false}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">
          {activeQuery ? `Search results for "${activeQuery}"` : 'Explore'}
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-full"
            columnClassName="px-2"
          >
            {Array.isArray(images) && images.length > 0 ? (
              images.map((image) => (
                <div
                  key={image.imageId}
                  className="mb-4 relative group overflow-hidden rounded-lg cursor-pointer"
                  onClick={() => handleImageClick(image.imageId)}
                >
                  <img
                    src={getImageUrl(image.imageUrl)}
                    alt={image.caption || 'Image'}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Overlay that appears on hover */}
                  <div className="absolute inset-0 group-hover:bg-black/40 transition-all duration-300 flex flex-col justify-between p-4">
                    {/* Like button */}
                    <div className="self-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLike(image.imageId);
                        }}
                        className="p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all"
                      >
                        <Heart
                          className={`${likedImages[image.imageId] ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                          size={20}
                        />
                      </button>
                    </div>

                    {/* Caption */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                      <h3 className="font-medium text-lg drop-shadow-md">
                        {image.caption || 'Untitled'}
                      </h3>
                      <p className="text-sm text-gray-200">
                        By @{image.userName || 'anonymous'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {activeQuery ? 'No images found matching your search' : 'No images found'}
                </p>
              </div>
            )}
          </Masonry>
        )}
      </div>
    </Layout>
  );
};

export default Feed;