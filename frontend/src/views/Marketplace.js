import React, { useState, useEffect } from 'react';
import NFTCard from '../components/NFTCard';

function Marketplace({ account, connected }) {
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data - In production, fetch from indexer or backend
  useEffect(() => {
    const mockNfts = [
      {
        id: 1,
        name: 'Cosmic Dreams #1',
        type: 'art',
        creator: 'ALGO123ABC...XYZ789',
        price: 5000000,
        purchasable: true,
        description: 'A stunning digital artwork exploring the cosmos',
        imageUrl: 'https://via.placeholder.com/400/6B46C1/FFFFFF?text=Cosmic+Dreams'
      },
      {
        id: 2,
        name: 'Summer Vibes',
        type: 'music',
        creator: 'ALGO456DEF...ABC123',
        price: 3000000,
        purchasable: true,
        description: 'Chill beats for summer days',
        imageUrl: 'https://via.placeholder.com/400/EC4899/FFFFFF?text=Summer+Vibes'
      },
      {
        id: 3,
        name: 'Genesis Collection',
        type: 'standard',
        creator: 'ALGO789GHI...DEF456',
        price: 0,
        purchasable: false,
        description: 'Limited edition genesis collectible',
        imageUrl: 'https://via.placeholder.com/400/8B5CF6/FFFFFF?text=Genesis'
      },
      {
        id: 4,
        name: 'Abstract Emotions',
        type: 'art',
        creator: 'ALGO234JKL...GHI789',
        price: 7500000,
        purchasable: true,
        description: 'Expressing feelings through abstract art',
        imageUrl: 'https://via.placeholder.com/400/F59E0B/FFFFFF?text=Abstract'
      },
      {
        id: 5,
        name: 'Epic Soundtrack',
        type: 'music',
        creator: 'ALGO567MNO...JKL012',
        price: 4000000,
        purchasable: true,
        description: 'Epic orchestral composition',
        imageUrl: 'https://via.placeholder.com/400/10B981/FFFFFF?text=Epic'
      },
      {
        id: 6,
        name: 'Community Badge',
        type: 'standard',
        creator: 'ALGO890PQR...MNO345',
        price: 0,
        purchasable: false,
        description: 'Free community supporter badge',
        imageUrl: 'https://via.placeholder.com/400/3B82F6/FFFFFF?text=Badge'
      }
    ];

    setTimeout(() => {
      setNfts(mockNfts);
      setFilteredNfts(mockNfts);
      setLoading(false);
    }, 1000);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...nfts];

    // Type filter
    if (filter !== 'all') {
      result = result.filter(nft => nft.type === filter);
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(nft =>
        nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    }

    setFilteredNfts(result);
  }, [filter, searchQuery, sortBy, nfts]);

  const filterOptions = [
    { value: 'all', label: 'All NFTs', icon: '🌟' },
    { value: 'art', label: 'Art', icon: '🎨' },
    { value: 'music', label: 'Music', icon: '🎵' },
    { value: 'standard', label: 'Standard', icon: '💎' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Explore Marketplace
        </h1>
        <p className="text-xl text-gray-300">
          Discover unique NFTs from talented creators
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Search NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Type Filter */}
          <div className="md:col-span-1">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="md:col-span-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === option.value
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700'
            }`}
          >
            {option.icon} {option.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-gray-300">
        Showing <span className="font-bold text-white">{filteredNfts.length}</span> {filteredNfts.length === 1 ? 'NFT' : 'NFTs'}
      </div>

      {/* NFT Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-4">Loading marketplace...</p>
        </div>
      ) : filteredNfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNfts.map(nft => (
            <NFTCard
              key={nft.id}
              nft={nft}
              account={account}
              showActions={connected}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">No NFTs Found</h3>
          <p className="text-gray-400">
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {/* Info Banner */}
      {!connected && (
        <div className="bg-purple-500/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-300">
            Connect your wallet to purchase NFTs and interact with the marketplace
          </p>
        </div>
      )}
    </div>
  );
}

export default Marketplace;