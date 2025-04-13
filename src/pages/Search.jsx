import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import ImageCard from '../components/ImageCard';
import { getCurrentUser } from '../services/auth';

function Search() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query') || '';
    const [searchQuery, setSearchQuery] = useState(query);
    const [images, setImages] = useState([]);
    const [likedImages, setLikedImages] = useState([]);
    const user = getCurrentUser();

    useEffect(() => {
        // Giả lập kết quả tìm kiếm dựa trên từ khóa
        if (query) {
            setImages([
                {
                    id: 1,
                    url: 'https://i.pinimg.com/736x/25/d3/5e/25d35e32569d9797b57ed0bb707dee41.jpg',
                    title: `Result for "${query}" - 1`,
                },
                {
                    id: 2,
                    url: 'https://i.pinimg.com/736x/64/a0/2b/64a02ba010363922593a235e1c31e194.jpg',
                    title: `Result for "${query}" - 2`,
                },
                {
                    id: 3,
                    url: 'https://i.pinimg.com/736x/26/53/b2/2653b20371ca8b4b66abf4db327af9c9.jpg',
                    title: `Result for "${query}" - 3`,
                },
                {
                    id: 4,
                    url: 'https://i.pinimg.com/736x/af/1e/8a/af1e8a1b8e02263d5b247b3640764ec2.jpg',
                    title: `Result for "${query}" - 4`,
                },
                {
                    id: 5,
                    url: 'https://i.pinimg.com/736x/de/3a/94/de3a9491bbdd5aeecd615ff43693236a.jpg',
                    title: `Result for "${query}" - 5`,
                },
            ]);
        }
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        // Handle search logic
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleLike = (imageId) => {
        if (user) {
            setLikedImages((prev) =>
                prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
            );
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <Header
                isSearchPage={true}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearch}
            />

            {/* Main Content */}
            <main className="pt-20 px-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Search Results for "{query}"</h2>
                
                <div className="columns-2 md:columns-4 gap-4">
                    {images.map((image) => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            isLiked={likedImages.includes(image.id)}
                            onLike={toggleLike}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Search;