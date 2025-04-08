import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

function Home() {
  return (
    <div className="bg-teal-50 min-h-screen pt-12">
      <Header />
      <main className="px-6 py-10">
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-teal-900">Save ideas you like</h1>
          <p className="text-lg text-teal-700 mt-4">
            Collect your favorites so you can get back to them later.
          </p>
          <Link to="/explore">
            <button className="mt-6 bg-red-600 text-white px-6 py-3 rounded-3xl hover:bg-red-700 cursor-pointer">
              Explore
            </button>
          </Link>
        </section>
        <section className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <img src="https://via.placeholder.com/300" alt="Fern future home vibes" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">Fern future home vibes</h3>
            </div>
          </div>
          <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <img src="https://via.placeholder.com/300" alt="My Scandinavian bedroom" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">My Scandinavian bedroom</h3>
            </div>
          </div>
          <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <img src="https://via.placeholder.com/300" alt="The deck of my dreams" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">The deck of my dreams</h3>
            </div>
          </div>
          <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <img src="https://via.placeholder.com/300" alt="Serve my drinks in style" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">Serve my drinks in style</h3>
            </div>
          </div>
          <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <img src="https://via.placeholder.com/300" alt="Our bathroom upgrade" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">Our bathroom upgrade</h3>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home