import React from 'react'
import Header from '../components/Header'

function Feed() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-20 px-6">
        {/* Featured Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Example Featured Images */}
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
              <img src="https://via.placeholder.com/300" alt="Featured 1" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <h3 className="text-white text-lg font-bold">Most Liked Image</h3>
              </div>
            </div>
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
              <img src="https://via.placeholder.com/300" alt="Featured 2" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <h3 className="text-white text-lg font-bold">Trending Now</h3>
              </div>
            </div>
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
              <img src="https://via.placeholder.com/300" alt="Featured 3" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <h3 className="text-white text-lg font-bold">Editor's Pick</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Images Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Example Latest Images */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="relative bg-white rounded-lg shadow-md overflow-hidden">
                <img src="https://via.placeholder.com/300" alt={`Latest ${index + 1}`} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <h3 className="text-white text-sm font-bold">Image {index + 1}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Feed