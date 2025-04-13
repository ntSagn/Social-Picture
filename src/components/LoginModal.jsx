import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'

function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(username, password)
      onClose()
      // Redirect to feed page after successful login
      navigate('/')
      // Force a page refresh to update the UI based on authentication state
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

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

        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/vite.svg"
            alt="Logo"
            className="mx-auto h-12"
          />
        </div>

        {/* Form */}
        <h2 className="text-2xl font-bold text-center mb-4">Log in to see more</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Username"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Password"
              required
            />
          </div>
          <div className="text-right mb-4">
            <a href="#" className="text-sm text-red-500 hover:underline">
              Forgot your password?
            </a>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Not on Pinterest yet?{' '}
            <button
              onClick={() => {
                onClose()
                onSwitchToRegister()
              }}
              className="text-red-500 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginModal