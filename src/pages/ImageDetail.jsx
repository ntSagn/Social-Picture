import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Flag, Share2, BookmarkPlus } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getCurrentUser } from '../services/auth';
import ReportModal from '../components/ReportModal';

function ImageDetail() {
  const { imageId } = useParams();
  const navigate = useNavigate();
  // const location = useLocation();
  const user = getCurrentUser();
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [relatedImages, setRelatedImages] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    // Simulate fetching image data
    setTimeout(() => {
      const mockImage = {
        id: parseInt(imageId),
        imageUrl: `https://i.pinimg.com/736x/25/d3/5e/25d35e32569d9797b57ed0bb707dee41.jpg`,
        caption: 'Beautiful sunset over the mountains',
        createdAt: '2023-10-15T14:30:00Z',
        user: {
          id: 1,
          username: 'nature_lover',
          profilePicture: 'https://i.pravatar.cc/150?img=3'
        },
        likes: 128,
        tags: ['nature', 'sunset', 'mountains', 'photography']
      };
      
      setImage(mockImage);
      
      // Mock comments
      const mockComments = [
        {
          id: 1,
          content: 'This is absolutely breathtaking!',
          createdAt: '2023-10-15T15:00:00Z',
          user: {
            id: 2,
            username: 'traveler123',
            profilePicture: 'https://i.pravatar.cc/150?img=4'
          },
          likes: 5
        },
        {
          id: 2,
          content: 'Where was this taken? I would love to visit!',
          createdAt: '2023-10-15T16:15:00Z',
          user: {
            id: 3,
            username: 'adventure_seeker',
            profilePicture: 'https://i.pravatar.cc/150?img=5'
          },
          likes: 3
        }
      ];
      
      setComments(mockComments);
      
      // Mock related images based on tags
      const mockRelated = [
        {
          id: 101,
          imageUrl: 'https://i.pinimg.com/736x/64/a0/2b/64a02ba010363922593a235e1c31e194.jpg',
          caption: 'Mountain lake at sunset',
          tags: ['nature', 'mountains', 'lake']
        },
        {
          id: 102,
          imageUrl: 'https://i.pinimg.com/736x/26/53/b2/2653b20371ca8b4b66abf4db327af9c9.jpg',
          caption: 'Hiking trail through nature',
          tags: ['nature', 'hiking', 'adventure']
        },
        {
          id: 103,
          imageUrl: 'https://i.pinimg.com/736x/af/1e/8a/af1e8a1b8e02263d5b247b3640764ec2.jpg',
          caption: 'Sunset through the forest',
          tags: ['nature', 'sunset', 'forest']
        }
      ];
      
      setRelatedImages(mockRelated);
      setIsLoading(false);
    }, 500);
  }, [imageId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleReport = () => {
    if (!user) {
      alert('Please log in to report this image');
      return;
    }
    
    setShowReportModal(true);
  };

  const handleLikeToggle = () => {
    if (user) {
      setIsLiked(!isLiked);
      // In a real app, we would make an API call here to update the like status
    } else {
      alert('Please log in to like this image');
    }
  };

  const handleSaveToggle = () => {
    if (user) {
      setIsSaved(!isSaved);
      // In a real app, we would make an API call here to save/unsave the image
    } else {
      alert('Please log in to save this image');
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to comment');
      return;
    }
    
    if (!comment.trim()) return;
    
    // In a real app, we would make an API call here to post the comment
    const newComment = {
      id: Date.now(),
      content: comment,
      createdAt: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture
      },
      likes: 0
    };
    
    setComments([newComment, ...comments]);
    setComment('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {user && <Sidebar />}
        <div className={`${user ? 'ml-16' : ''} w-full`}>
          <Header />
          <div className="pt-20 flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {user && <Sidebar />}
        <div className={`${user ? 'ml-16' : ''} w-full`}>
          <Header />
          <div className="pt-20 px-6 py-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Image not found</h2>
            <button 
              onClick={handleGoBack}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {user && <Sidebar />}
      <div className={`${user ? 'ml-16' : ''} w-full`}>
        <Header />
        <main className="pt-20 px-4 md:px-6 py-6">
          {/* Back Button */}
          <button 
            onClick={handleGoBack}
            className="flex items-center text-gray-700 mb-4 hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Image and Comments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative">
                  <img 
                    src={image.imageUrl} 
                    alt={image.caption} 
                    className="w-full object-cover max-h-[600px]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h1 className="text-white text-xl font-bold">{image.caption}</h1>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4">
                  {/* User info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={image.user.profilePicture} 
                        alt={image.user.username} 
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{image.user.username}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={handleReport}
                        className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                        title="Report this image"
                      >
                        <Flag size={20} />
                      </button>
                      <button 
                        className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
                        title="Share this image"
                      >
                        <Share2 size={20} />
                      </button>
                      <button 
                        onClick={handleSaveToggle}
                        className={`p-2 rounded-full hover:bg-gray-100 ${isSaved ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                        title={isSaved ? "Remove from saved" : "Save this image"}
                      >
                        <BookmarkPlus size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Actions and stats */}
                  <div className="flex items-center mt-4 border-t border-b border-gray-100 py-3">
                    <button
                      onClick={handleLikeToggle}
                      className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                    >
                      <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                      <span>{isLiked ? image.likes + 1 : image.likes} likes</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 ml-6">
                      <MessageCircle size={20} />
                      <span>{comments.length} comments</span>
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700">Tags:</h3>
                    <div className="flex flex-wrap mt-1">
                      {image.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mr-2 mt-1"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800">Comments</h2>
                  
                  {/* Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="mt-4">
                    <div className="flex">
                      <img 
                        src={user ? user.profilePicture : "https://i.pravatar.cc/150?img=0"} 
                        alt="Profile" 
                        className="h-10 w-10 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder={user ? "Add a comment..." : "Log in to add a comment..."}
                          disabled={!user}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                          rows="2"
                        ></textarea>
                        {user && (
                          <button
                            type="submit"
                            disabled={!comment.trim()}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                          >
                            Comment
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                  
                  {/* Comments List */}
                  <div className="mt-6 space-y-4">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex">
                          <img 
                            src={comment.user.profilePicture} 
                            alt={comment.user.username} 
                            className="h-10 w-10 rounded-full mr-3"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 p-3 rounded-xl">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900">{comment.user.username}</p>
                                  <p className="text-gray-700">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                              <button className="flex items-center hover:text-red-500">
                                <Heart size={14} className="mr-1" />
                                <span>{comment.likes}</span>
                              </button>
                              <button className="hover:text-gray-700">Reply</button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 my-6">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Related Images */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">More like this</h2>
                <div className="space-y-4">
                  {relatedImages.map((relImg) => (
                    <div 
                      key={relImg.id} 
                      className="group cursor-pointer"
                      onClick={() => navigate(`/image/${relImg.id}`)}
                    >
                      <div className="relative rounded-lg overflow-hidden">
                        <img 
                          src={relImg.imageUrl} 
                          alt={relImg.caption} 
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                          <button className="text-white text-xl">
                            🤍
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 truncate">{relImg.caption}</p>
                      <div className="flex flex-wrap mt-1">
                        {relImg.tags.slice(0, 2).map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full mr-1 mt-1"
                          >
                            #{tag}
                          </span>
                        ))}
                        {relImg.tags.length > 2 && (
                          <span className="text-xs text-gray-500 mt-1">+{relImg.tags.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {showReportModal && image && (
        <ReportModal
          image={image}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

export default ImageDetail;