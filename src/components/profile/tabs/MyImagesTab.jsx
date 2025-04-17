import React from 'react';
import { getImageUrl } from '../../../utils/imageUtils';

const MyImagesTab = ({ images, handleImageClick, isCurrentUser }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{isCurrentUser ? 'My Images' : 'Posts'}</h3>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
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
        <p className="text-gray-500 text-center py-8">
          {isCurrentUser ? "You haven't uploaded any images yet." : "This user hasn't posted any images yet."}
        </p>
      )}
    </div>
  );
};

export default MyImagesTab;