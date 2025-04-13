import React, { useState } from 'react';
import { Heart, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import ReportModal from './ReportModal';

function ImageCard({ image, onLike, isLiked = false }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [showReportModal, setShowReportModal] = useState(false);
  
  const handleImageClick = () => {
    navigate(`/image/${image.id}`);
  };
  
  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (user) {
      onLike?.(image.id);
    } else {
      alert('Please log in to like images');
    }
  };
  
  const handleReportClick = (e) => {
    e.stopPropagation();
    if (user) {
      setShowReportModal(true);
    } else {
      alert('Please log in to report images');
    }
  };

  return (
    <>
      <div
        className="relative mb-4 group cursor-pointer overflow-hidden rounded-lg"
        onClick={handleImageClick}
      >
        <img
          src={image.url || image.imageUrl}
          alt={image.title || image.caption}
          className="w-full rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Caption overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white font-medium truncate">
            {image.title || image.caption}
          </p>
        </div>
        
        {/* Action buttons overlay */}
        <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-2">
            <button
              onClick={handleReportClick}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
              title="Report this image"
            >
              <Flag size={16} />
            </button>
            <button
              onClick={handleLikeClick}
              className={`p-2 ${isLiked ? 'bg-red-600' : 'bg-black/50 hover:bg-black/70'} rounded-full text-white`}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart size={16} fill={isLiked ? "white" : "none"} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          image={image}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
}

export default ImageCard;