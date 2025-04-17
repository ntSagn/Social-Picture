import React from 'react';
import { getImageUrl } from '../../../utils/imageUtils';
import defaultAvatar from '../../../assets/default-avatar.png';
import { useNavigate } from 'react-router-dom';

const FollowingTab = ({ following, handleUnfollow }) => {
    const navigate = useNavigate();
    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Following</h3>
            {following.length > 0 ? (
                <div className="space-y-4">
                    {following.map((follow) => (
                        <div
                            key={follow.userId}
                            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    src={getImageUrl(follow.profilePicture) || defaultAvatar}
                                    alt={follow.username}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                                <span className="font-medium">{follow.username}</span>
                            </div>
                            <div className='flex items-center space-x-4'>
                                <button
                                    onClick={() => navigate(`/profile/${follow.userId}`)}
                                    className="px-4 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-100"
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={() => handleUnfollow(follow.userId)}
                                    className="px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200"
                                >
                                    Unfollow
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-8">You're not following anyone yet.</p>
            )}
        </div>
    );
};

export default FollowingTab;