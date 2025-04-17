import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import defaultAvatar from '../../assets/default-avatar.png';

const Comment = ({ 
  comment, 
  currentUser, 
  onLike, 
  onReply, 
  isReplying,
  replyContent,
  setReplyContent,
  onReplySubmit,
  onCancelReply
}) => {
  return (
    <div className="flex space-x-2">
      <Link to={`/profile/${comment.userId}`}>
        <img
          src={getImageUrl(comment.userProfilePicture) || defaultAvatar}
          alt={comment.username}
          className="h-8 w-8 rounded-full object-cover"
        />
      </Link>
      <div className="flex-1">
        <div className="bg-gray-100 p-3 rounded-lg">
          <Link to={`/profile/${comment.userId}`} className="font-medium mr-2">
            {comment.username}
          </Link>
          <p>{comment.content}</p>
        </div>
        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          
          {/* Reply button */}
          {currentUser && (
            <button onClick={() => onReply(comment.commentId)}>Reply</button>
          )}
          
          {/* Like button */}
          <button 
            onClick={() => currentUser && onLike(comment.commentId, comment.isLikedByCurrentUser)}
            className="flex items-center space-x-1"
          >
            <Heart 
              size={14} 
              className={comment.isLikedByCurrentUser ? "fill-red-500 text-red-500" : ""} 
            />
            <span>{comment.likesCount || 0} likes</span>
          </button>
        </div>

        {/* Reply form */}
        {isReplying && (
          <form onSubmit={onReplySubmit} className="mt-2">
            <div className="flex items-start space-x-2">
              <img
                src={getImageUrl(currentUser?.profilePicture) || defaultAvatar}
                alt={currentUser?.username}
                className="h-6 w-6 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${comment.username}...`}
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="2"
                />
                <div className="flex justify-end mt-1 space-x-2">
                  <button
                    type="button"
                    onClick={onCancelReply}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg disabled:bg-red-300"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4 mt-2 space-y-2">
            {comment.replies.map(reply => (
              <div key={reply.commentId} className="flex space-x-2">
                <Link to={`/profile/${reply.userId}`}>
                  <img
                    src={getImageUrl(reply.userProfilePicture) || defaultAvatar}
                    alt={reply.username}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Link to={`/profile/${reply.userId}`} className="font-medium mr-2">
                      {reply.username}
                    </Link>
                    <p>{reply.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                    
                    {/* Like button for reply */}
                    <button 
                      onClick={() => currentUser && onLike(reply.commentId, reply.isLikedByCurrentUser)}
                      className="flex items-center space-x-1"
                    >
                      <Heart 
                        size={12} 
                        className={reply.isLikedByCurrentUser ? "fill-red-500 text-red-500" : ""} 
                      />
                      <span>{reply.likesCount || 0} likes</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;