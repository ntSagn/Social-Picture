import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Lock, Globe } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getCurrentUser } from '../services/auth';

function UploadImage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [imageUrl, setImageUrl] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Redirect if not logged in
  if (!user) {
    navigate('/');
    return null;
  }

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

      setIsImageLoading(true);
      setError('');

      // In a real app, you would upload the file to a server
      // For demo, we'll create a local URL
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

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!imageUrl) {
      setError('Please select an image');
      return;
    }

    // In a real app, you would send the data to your API
    // For demo, we'll just simulate a successful upload
    setIsImageLoading(true);
    setTimeout(() => {
      setIsImageLoading(false);
      // Redirect to profile page after "upload"
      navigate('/profile');
    }, 1500);
  };

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
                    className={`flex items-center px-4 py-2 rounded-lg border ${
                      isPublic 
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
                    className={`flex items-center px-4 py-2 rounded-lg border ${
                      !isPublic 
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