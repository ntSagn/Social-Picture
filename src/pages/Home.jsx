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
            <img src="https://i.pinimg.com/736x/de/3a/94/de3a9491bbdd5aeecd615ff43693236a.jpg" alt="Fern future home vibes" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">Fern future home vibes</h3>
            </div>
          </div>
          <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <img src="https://i.pinimg.com/736x/26/53/b2/2653b20371ca8b4b66abf4db327af9c9.jpg" alt="My Scandinavian bedroom" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">My Scandinavian bedroom</h3>
            </div>
          </div>
          <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <img src="https://i.pinimg.com/736x/af/1e/8a/af1e8a1b8e02263d5b247b3640764ec2.jpg" alt="The deck of my dreams" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">The deck of my dreams</h3>
            </div>
          </div>
          <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <img src="https://i.pinimg.com/736x/64/a0/2b/64a02ba010363922593a235e1c31e194.jpg" alt="Serve my drinks in style" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">Serve my drinks in style</h3>
            </div>
          </div>
          <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
            <img src="https://i.pinimg.com/474x/ce/4b/78/ce4b78b179e87aa0c14f7d7053c06a21.jpg" alt="Our bathroom upgrade" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <h3 className="text-white text-lg font-bold">Our bathroom upgrade</h3>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home