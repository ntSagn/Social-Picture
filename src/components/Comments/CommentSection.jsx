import React, { useState, useEffect } from 'react';
import { commentService } from '../../api/commentService';
import { commentLikeService } from '../../api/commentLikeService';
import { getImageUrl } from '../../utils/imageUtils';
import { useAuth } from '../../contexts/AuthContext';
import defaultAvatar from '../../assets/default-avatar.png';
import Comment from './Comment';

const CommentSection = ({ imageId, initialComments = [], onCommentCountChange }) => {
  const { currentUser } = useAuth() || { currentUser: null };
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    try {
      setIsLoading(true);
      const response = await commentService.create({
        imageId: parseInt(imageId),
        content: newComment,
        parentCommentId: null
      });

      // Update UI with new comment
      setComments(prev => [response.data, ...prev]);
      setNewComment('');

      // Update comment count on parent component
      if (onCommentCountChange) {
        onCommentCountChange(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !replyContent.trim() || !replyingTo) return;

    try {
      setIsLoading(true);
      const response = await commentService.create({
        imageId: parseInt(imageId),
        content: replyContent,
        parentCommentId: replyingTo
      });

      // Update UI with new reply
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.commentId === replyingTo) {
            // Add new reply to the parent comment
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data],
              repliesCount: (comment.repliesCount || 0) + 1
            };
          }
          return comment;
        });
      });

      // Reset reply state
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error("Error posting reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentLike = async (commentId, isLiked) => {
    if (!currentUser) return;

    try {
      // Optimistic UI update
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.commentId === commentId) {
            return {
              ...comment,
              isLikedByCurrentUser: !isLiked,
              likesCount: isLiked ? (comment.likesCount - 1) : (comment.likesCount + 1)
            };
          }
          
          // Also check in replies
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply.commentId === commentId) {
                return {
                  ...reply,
                  isLikedByCurrentUser: !isLiked,
                  likesCount: isLiked ? (reply.likesCount - 1) : (reply.likesCount + 1)
                };
              }
              return reply;
            });
            return { ...comment, replies: updatedReplies };
          }
          
          return comment;
        });
      });

      // API call
      if (!isLiked) {
        await commentLikeService.like(commentId);
      } else {
        await commentLikeService.unlike(commentId);
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      // Revert UI changes on error
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.commentId === commentId) {
            return {
              ...comment,
              isLikedByCurrentUser: isLiked,
              likesCount: isLiked ? (comment.likesCount + 1) : (comment.likesCount - 1)
            };
          }
          
          // Also revert in replies
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply.commentId === commentId) {
                return {
                  ...reply,
                  isLikedByCurrentUser: isLiked,
                  likesCount: isLiked ? (reply.likesCount + 1) : (reply.likesCount - 1)
                };
              }
              return reply;
            });
            return { ...comment, replies: updatedReplies };
          }
          
          return comment;
        });
      });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Comments</h3>

      {/* Comment Form */}
      {currentUser && (
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <div className="flex items-start space-x-2">
            <img
              src={getImageUrl(currentUser.profilePicture) || defaultAvatar}
              alt={currentUser.username}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:bg-red-300"
                >
                  {isLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet</p>
        ) : (
          comments.map(comment => (
            <Comment 
              key={comment.commentId}
              comment={comment}
              currentUser={currentUser}
              onLike={handleCommentLike}
              onReply={(commentId) => {
                setReplyingTo(commentId);
                setReplyContent('');
              }}
              isReplying={replyingTo === comment.commentId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onReplySubmit={handleReplySubmit}
              onCancelReply={() => setReplyingTo(null)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;