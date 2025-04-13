import React, { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, Search, LogOut, User } from 'lucide-react'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import { getCurrentUser, logout } from '../services/auth'

function Header({ isSearchPage, searchQuery = '', onSearchChange }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isExplorePage = location.pathname === '/explore'
  const [isLoginModalOpen, setLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const user = getCurrentUser()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    // Navigate to home page after logout
    navigate('/')
    window.location.reload()
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-40 py-3">        <div className="flex justify-between items-center px-6">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-4">
          <Link to="/">
            <img src="/vite.svg" alt="Logo" className="h-8" />
          </Link>
          {/* Only show Explore link for non-logged in users */}
          {!user && (
            <nav className="flex items-center space-x-6">
              <Link
                to="/explore"
                className={`px-4 py-2 rounded-full ${isExplorePage ? 'bg-black text-white' : 'text-gray-700 hover:text-gray-900'
                  }`}
              >
                Explore
              </Link>
            </nav>
          )}
        </div>

        {/* Search Bar */}
        {(isExplorePage || isSearchPage || user) && (
          <div className="flex-1 mx-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e)}
                placeholder="Search for easy dinners, fashion, etc."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
              />
            </form>
          </div>
        )}

        {/* User is logged in - show avatar only */}
        {user ? (
          <div className="flex items-center space-x-4" ref={dropdownRef}>
            <div className="relative">
              <img
                src={user.profilePicture}
                alt={user.username}
                className="h-10 w-10 rounded-full cursor-pointer"
                onClick={toggleDropdown}
              />
              {/* Dropdown menu - visible when isDropdownOpen is true */}
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
          /* User not logged in - show login/signup buttons */
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
        onSwitchToRegister={() => setRegisterModalOpen(true)}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => setLoginModalOpen(true)}
      />
    </>
  )
}

export default Header