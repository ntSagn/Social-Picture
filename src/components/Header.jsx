import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import defaultProfilePic from '../assets/default-avatar.png';
import { getImageUrl } from '../utils/imageUtils';

function Header({ isSearchPage, searchQuery = '', onSearchChange, onSearchSubmit, toggleNotification }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isExplorePage = location.pathname === '/explore';
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Use AuthContext instead of local storage
  const { currentUser, logout: authLogout } = useAuth() || { currentUser: null };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Use the local or prop search query based on which one is controlling the input
    const currentQuery = onSearchChange ? searchQuery : localSearchQuery;

    if (onSearchSubmit) {
      onSearchSubmit(e);
    } else if (currentQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(currentQuery)}`);
    }
  };

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setLocalSearchQuery(newValue);

    if (onSearchChange) {
      onSearchChange(e);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30">
        <div className="mx-auto px-10 py-2 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-red-600">
              <img src="/logo.png" alt="Logo" className="w-10 h-auto" />
            </Link>

            {/* Navigation links - only show for guest */}
            {!currentUser && (
              <nav className="flex items-center space-x-6">
                <Link
                  to="/explore"
                  className={`px-4 py-2 rounded-full ${isExplorePage ? 'bg-black text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  Explore
                </Link>
              </nav>
            )}
          </div>

          {/* Search Bar */}
          {(isExplorePage || isSearchPage || currentUser) && (
            <div className="flex-1 mx-6">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  value={onSearchChange ? searchQuery : localSearchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for easy dinners, fashion, etc."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                />
              </form>
            </div>
          )}

          {/* User is logged in - show avatar */}
          {currentUser ? (
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="relative" ref={dropdownRef}>
                {currentUser.profilePicture ? (
                  <img
                    src={getImageUrl(currentUser.profilePicture) || "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"}
                    alt={currentUser.username}
                    className="h-10 w-10 rounded-full cursor-pointer object-cover border border-gray-200"
                    onClick={toggleDropdown}
                  />
                ) : <img
                  src={defaultProfilePic}
                  alt={currentUser.username}
                  className="h-10 w-10 rounded-full cursor-pointer object-cover border border-gray-200"
                  onClick={toggleDropdown}
                />}
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800 cursor-pointer"
              >
                <LogIn size={20} />
                <span>Log in</span>
              </button>
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-3xl hover:bg-red-700 cursor-pointer"
              >
                <UserPlus size={20} />
                <span>Sign up</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </>
  );
}

export default Header;