import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Flag, UserPlus, UserMinus, X, Globe, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import ReportModal from '../components/ReportModal';
import CommentSection from '../components/Comments/CommentSection'; // Import our new component
import { imagesService } from '../api/imagesService';
import { likesService } from '../api/likesService';
import { commentService } from '../api/commentService';
import { tagsService } from '../api/tagsService';
import { followsService } from '../api/followsService';
import { reportsService } from '../api/reportsService';
import { savedImagesService } from '../api/savedImagesService';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import defaultAvatar from '../assets/default-avatar.png';

const ImageDetail = () => {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth() || { currentUser: null };

  const [image, setImage] = useState(null);
  const [imageTags, setImageTags] = useState([]);
  const [comments, setComments] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const fetchImageTags = async () => {
      if (!imageId) return;

      try {
        const tagsResponse = await tagsService.getTagsForImage(imageId);
        setImageTags(tagsResponse.data || []);
      } catch (error) {
        console.error("Error fetching image tags:", error);
      }
    };

    fetchImageTags();
  }, [imageId]);

  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch image details
        const imageResponse = await imagesService.getById(imageId);
        setImage(imageResponse.data);
        setIsPublic(imageResponse.data.isPublic);
        // Fetch comments for the image
        const commentsResponse = await commentService.getByImageId(imageId);
        setComments(commentsResponse.data);
        if (imageResponse.data) {
          setEditCaption(imageResponse.data.caption || '');
        }
        // Check if user liked the image (only if logged in)
        if (currentUser) {
          try {
            const likeResponse = await likesService.checkLike(imageId);
            setIsLiked(likeResponse.data);

            // Check if the image is saved by the current user - make a separate API call
            const savedResponse = await savedImagesService.checkSaved(imageId);
            setIsSaved(savedResponse.data.isSaved);

            // Check if the user follows the image creator
            if (imageResponse.data.userId !== currentUser.userId) {
              const followResponse = await followsService.checkFollowing(imageResponse.data.userId);
              setIsFollowing(followResponse.data);
            }
          } catch (error) {
            console.error("Error checking user interactions:", error);
          }
        }
      } catch (err) {
        console.error("Error fetching image details:", err);
        setError("Failed to load image details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageDetails();
  }, [imageId, currentUser]);

  useEffect(() => {
    // Close menu when clicking outside
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setEditMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditSave = async () => {
    if (!currentUser || !image) return;

    try {
      // Update image caption
      await imagesService.update(imageId, {
        caption: editCaption,
        isPublic: isPublic
      });

      // Update local state
      setImage(prev => ({
        ...prev,
        caption: editCaption,
        isPublic: isPublic
      }));

      // Exit edit mode
      setIsEditing(false);
      setEditMenuOpen(false);

      // Show success message
      alert('Image updated successfully');
    } catch (error) {
      console.error("Error updating image:", error);
    }
  };

  // Add this with your other handler functions
  const handleDeleteImage = async () => {
    try {
      await imagesService.delete(parseInt(imageId));
      // Show success message
      alert('Image deleted successfully');
      // Redirect to user profile after deletion
      navigate(`/profile`);
    } catch (error) {
      console.error("Error deleting image:", error);
      alert(error);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      // Redirect to login or show login modal
      return;
    }

    try {
      // Optimistic UI update
      setIsLiked(prevState => !prevState);
      setImage(prev => ({
        ...prev,
        likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1
      }));

      // API call
      if (!isLiked) {
        await likesService.like(imageId);
      } else {
        await likesService.unlike(imageId);
      }
    } catch (error) {
      // Revert UI on error
      setIsLiked(prevState => !prevState);
      setImage(prev => ({
        ...prev,
        likesCount: isLiked ? prev.likesCount + 1 : prev.likesCount - 1
      }));
      console.error("Error toggling like:", error);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();

    if (!newTag.trim() || !currentUser || !image) return;

    try {
      const tagName = newTag.trim();

      // Check if tag already exists on this image
      if (imageTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
        alert('This tag already exists on this image');
        return;
      }

      let tagId;

      // Try to find existing tag
      try {
        const tagResponse = await tagsService.getByName(tagName);
        tagId = tagResponse.data.tagId;
      } catch (error) {
        // Tag doesn't exist, create it
        if (error.response && error.response.status === 404) {
          const newTagResponse = await tagsService.create({ name: tagName });
          tagId = newTagResponse.data.tagId;
        } else {
          throw error;
        }
      }

      // Add tag to image
      await tagsService.addTagToImage(imageId, tagId);

      // Refresh tags
      const tagsResponse = await tagsService.getTagsForImage(imageId);
      setImageTags(tagsResponse.data || []);

      // Clear input
      setNewTag('');
    } catch (error) {
      console.error("Error adding tag:", error);
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

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      // Check current saved state from API to be sure
      const savedCheckResponse = await savedImagesService.checkSaved(imageId);
      console.log("Save check response:", savedCheckResponse);

      // Make sure we handle the response structure correctly
      const isCurrentlySaved = savedCheckResponse.data.isSaved;
      console.log("Is currently saved:", isCurrentlySaved);

      // Update UI based on actual state
      setIsSaved(!isCurrentlySaved);

      // API call based on actual state
      if (!isCurrentlySaved) {
        const saveResponse = await savedImagesService.saveImage(imageId);
        console.log("Save response:", saveResponse);
      } else {
        const unsaveResponse = await savedImagesService.unsaveImage(imageId);
        console.log("Unsave response:", unsaveResponse);
      }
    } catch (error) {
      // Revert UI on error
      setIsSaved(prevState => !prevState);
      console.error("Error toggling save:", error);
      console.error("Error details:", error.response?.data);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !image) return;

    try {
      // Optimistic UI update
      setIsFollowing(prevState => !prevState);

      // API call
      if (!isFollowing) {
        await followsService.follow(image.userId);
      } else {
        await followsService.unfollow(image.userId);
      }
    } catch (error) {
      // Revert UI on error
      setIsFollowing(prevState => !prevState);
      console.error("Error toggling follow:", error);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !reportReason.trim()) return;

    try {
      await reportsService.createReport({
        imageId: parseInt(imageId),
        reason: reportReason,
        description: reportDescription
      });

      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');

      // Show success message
      alert("Report submitted successfully");
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const handleCommentCountChange = (newCount) => {
    setImage(prev => ({
      ...prev,
      commentsCount: newCount
    }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !image) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error || "Image not found"}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image Section */}
          <div className="flex-1">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={getImageUrl(image.imageUrl)}
                alt={image.caption || 'Image'}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1">
            {/* Header with user info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Link to={`/profile/${image.userId}`} className="flex items-center">
                  <img
                    src={getImageUrl(image.userProfilePicture) || defaultAvatar}
                    alt={image.userName}
                    className="h-10 w-10 rounded-full object-cover mr-3"
                  />
                  <span className="font-medium">{image.userName}</span>
                </Link>
              </div>

              {/* User actions */}
              <div className="flex items-center space-x-2">
                {currentUser && currentUser.userId !== image.userId && (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center ${isFollowing
                      ? 'text-gray-700'
                      : 'bg-red-500 text-white px-3 py-1 rounded'
                      }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus size={18} className="mr-1" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} className="mr-1" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}

                {/* More options dropdown */}
                <div className="relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={() => setEditMenuOpen(!editMenuOpen)}
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {editMenuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20"
                    >
                      {/* Only show edit option for image owner */}
                      {currentUser && currentUser.userId === image.userId && (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setEditMenuOpen(false);
                            }}
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirmModal(true);
                              setEditMenuOpen(false);
                            }}
                            className="block px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setShowReportModal(true);
                          setEditMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                      >
                        Report image
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Caption */}
            <div className="mb-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                      Caption
                    </label>
                    <textarea
                      id="caption"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="3"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {imageTags.map(tag => (
                        <span
                          key={tag.tagId}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          #{tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.tagId)}
                            className="ml-1 text-gray-500 hover:text-red-600"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <form onSubmit={handleAddTag} className="flex">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a new tag"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-r-md hover:bg-red-700"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                  {/* Privacy settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Privacy Settings
                    </label>
                    <div className="flex items-center space-x-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setIsPublic(true)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md ${isPublic
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                      >
                        <Globe size={16} />
                        <span>Public</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPublic(false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md ${!isPublic
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                      >
                        <Lock size={16} />
                        <span>Private</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {isPublic
                        ? 'Public images are visible to everyone'
                        : 'Private images are only visible to you'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditSave}
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
                  <p className="mb-2 text-lg">{image.caption || 'No caption'}</p>

                  {/* Display tags */}
                  {imageTags && imageTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                      {imageTags.map(tag => (
                        <Link
                          key={tag.tagId}
                          to={`/tags/${tag.name}`}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-500 text-sm">
                    {new Date(image.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-1"
                >
                  <Heart
                    size={24}
                    className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                  />
                  <span>{image.likesCount || 0}</span>
                </button>

                <button className="flex items-center space-x-1">
                  <MessageCircle size={24} />
                  <span>{image.commentsCount || 0}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  className="p-2 flex items-center"
                  title={isSaved ? "Unsave image" : "Save image"}
                >
                  <Bookmark
                    size={24}
                    className={isSaved === true ? 'fill-black text-black' : 'text-gray-700'}
                  />
                </button>

                {currentUser && currentUser.userId !== image.userId && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2 text-gray-700"
                  >
                    <Flag size={24} />
                  </button>
                )}
              </div>
            </div>

            {/* Comments Section - Using our new component */}
            <CommentSection
              imageId={imageId}
              initialComments={comments}
              onCommentCountChange={(newValue) => {
                // Either set directly or use a callback
                if (typeof newValue === 'function') {
                  setImage(prev => ({
                    ...prev,
                    commentsCount: newValue(prev.commentsCount || 0)
                  }));
                } else {
                  setImage(prev => ({
                    ...prev,
                    commentsCount: newValue
                  }));
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          reportReason={reportReason}
          setReportReason={setReportReason}
          reportDescription={reportDescription}
          setReportDescription={setReportDescription}
        />
      )}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold text-center mb-4">Confirm Image Deletion</h2>

            <div className="mb-4 flex items-center justify-center">
              <img
                src={getImageUrl(image.imageUrl)}
                alt={image.caption}
                className="h-32 rounded shadow-sm"
              />
            </div>

            <p className="mb-6 text-gray-700 text-center">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteImage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ImageDetail;