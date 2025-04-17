import React, { useState } from 'react';
import { usersService } from '../api/usersService';

function ChangePasswordModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validation
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }
    
        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return;
        }
    
        setError('');
        setIsLoading(true);
        setSuccess(false);
    
        try {
            // Send password data as an object with the expected property names
            await usersService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
    
            // Reset form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
    
            setSuccess(true);
            // Close the modal after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Password change error:', err);
            setError(
                err.response?.data?.message ||
                'Failed to change password. Please check your current password and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-center mb-6">Change Password</h2>

                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-lg text-center">
                        Password changed successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter your current password"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300"
                    >
                        {isLoading ? 'Changing Password...' : success ? 'Password Changed' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordModal;