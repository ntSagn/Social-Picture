import React, { useState } from 'react';
import Layout from '../components/Layout';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const Home = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openLoginModal = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to our Image Sharing Platform</h1>
          <p className="text-xl text-gray-600 mb-8">Discover and share beautiful images with the world</p>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={openLoginModal}
              className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={openRegisterModal}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Featured content for guests */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Featured Images</h2>
          {/* You could show some public images here */}
        </div>

        {/* Modals */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          onSwitchToRegister={openRegisterModal} 
        />
        <RegisterModal 
          isOpen={showRegisterModal} 
          onClose={() => setShowRegisterModal(false)} 
          onSwitchToLogin={openLoginModal} 
        />
      </div>
    </Layout>
  );
};

export default Home;