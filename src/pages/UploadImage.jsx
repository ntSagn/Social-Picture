import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Lock, Globe } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { imagesService } from '../api/imagesService';
import { tagsService } from '../api/tagsService';
import { useAuth } from '../contexts/AuthContext';

function UploadImage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }

      setSelectedFile(file);
      setIsImageLoading(true);
      setError('');

      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
        setIsImageLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setIsImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = async (tagId) => {
    if (!currentUser || !image || currentUser.userId !== image.userId) return;
    
    try {
      await tagsService.removeTagFromImage(imageId, tagId);
      
      // Update local state
      setImageTags(prev => prev.filter(tag => tag.tagId !== tagId));
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };

  // In UploadImage.jsx, update the handleSubmit function

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    try {
      setIsImageLoading(true);

      // Create FormData object for the API request
      const formData = new FormData();
      formData.append('imageFile', selectedFile);
      formData.append('Caption', caption);
      formData.append('IsPublic', isPublic);

      // Upload the image using the Images API
      const response = await imagesService.create(formData);
      console.log('Image uploaded successfully:', response);

      // Handle tag creation and association for the image
      if (tags.length > 0) {
        try {
          const imageId = response.data.imageId;

          for (const tagName of tags) {
            // First try to get the tag by name to see if it exists
            try {
              const existingTagResponse = await tagsService.getByName(tagName);
              const tagId = existingTagResponse.data.tagId;

              // If tag exists, associate it with the image
              await tagsService.addTagToImage(imageId, tagId);
              console.log(`Added existing tag ${tagName} to image`);
            } catch (tagError) {
              if (tagError.response && tagError.response.status === 404) {
                // Tag doesn't exist, create new tag
                const newTagResponse = await tagsService.create({ name: tagName });
                const newTagId = newTagResponse.data.tagId;

                // Associate new tag with the image
                await tagsService.addTagToImage(imageId, newTagId);
                console.log(`Created and added new tag ${tagName} to image`);
              } else {
                console.error(`Error processing tag ${tagName}:`, tagError);
              }
            }
          }
        } catch (tagError) {
          console.error('Error adding tags:', tagError);
          // Continue even if tag addition fails
        }
      }

      // Show success message and redirect
      alert('Image uploaded successfully!');
      navigate('/profile');

    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsImageLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Sidebar />
      <div className="ml-16 w-full">
        <Header />
        <main className="pt-20 px-6 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Upload your image</h1>

            {error && (
              <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Area */}
              <div
                onClick={handleImageClick}
                className={`relative border-2 border-dashed rounded-lg p-4 min-h-[300px] flex flex-col items-center justify-center cursor-pointer ${imageUrl ? 'border-green-500' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {isImageLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your image...</p>
                  </div>
                ) : imageUrl ? (
                  <div className="relative w-full">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="mx-auto max-h-[400px] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Upload size={48} className="mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-600">Click to upload an image</p>
                    <p className="text-sm text-gray-500">JPG, PNG, GIF files are supported</p>
                  </div>
                )}
              </div>

              {/* Caption */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <textarea
                  id="caption"
                  rows="3"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption for your image..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                ></textarea>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (optional)
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-gray-200 px-4 py-2 rounded-r-lg hover:bg-gray-300"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Privacy Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex items-center px-4 py-2 rounded-lg border ${isPublic
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-300 text-gray-700'
                      }`}
                  >
                    <Globe size={20} className="mr-2" />
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex items-center px-4 py-2 rounded-lg border ${!isPublic
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-300 text-gray-700'
                      }`}
                  >
                    <Lock size={20} className="mr-2" />
                    Private
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {isPublic
                    ? 'Anyone can see this image'
                    : 'Only you can see this image'}
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isImageLoading || !imageUrl}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isImageLoading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UploadImage;