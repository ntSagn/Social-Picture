import React, { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { LogIn, UserPlus, Search } from 'lucide-react'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

function Header() {
  const location = useLocation()
  const isExplorePage = location.pathname === '/explore'
  const [isLoginModalOpen, setLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false)

  return (
    <>
      <header className={`fixed top-0 left-0 w-full bg-white shadow-md z-50 ${isExplorePage ? 'py-2' : 'py-4'}`}>
        <div className="flex justify-between items-center px-6">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img src="/vite.svg" alt="Logo" className="h-8" />
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                to="/explore"
                className={`px-4 py-2 rounded-full ${
                  isExplorePage ? 'bg-black text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Explore
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          {isExplorePage && (
            <div className="flex-1 mx-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search for easy dinners, fashion, etc."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          )}

          {/* Log in and Sign up Buttons */}
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