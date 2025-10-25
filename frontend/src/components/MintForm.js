import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function MintForm({ account, onMintSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'art',
    purchasable: false,
    price: '',
    description: '',
    file: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.file) {
        throw new Error('Name and file are required');
      }

      if (formData.purchasable && (!formData.price || parseFloat(formData.price) <= 0)) {
        throw new Error('Valid price required for purchasable NFTs');
      }

      // Convert price to microAlgos if purchasable
      const priceInMicroAlgos = formData.purchasable 
        ? Math.floor(parseFloat(formData.price) * 1000000) 
        : 0;

      // Create mint transaction
      const response = await axios.post(`${API_URL}/nfts/mint`, {
        creator: account,
        name: formData.name,
        type: formData.type,
        purchasable: formData.purchasable,
        price: priceInMicroAlgos,
        assetName: formData.name,
        unitName: 'NFT',
        url: '', // In production, upload to IPFS first
        metadata: formData.description
      });

      if (response.data.success) {
        // In production, sign with wallet
        alert('Mint transaction created! Please sign in your wallet.');
        
        // Reset form
        setFormData({
          name: '',
          type: 'art',
          purchasable: false,
          price: '',
          description: '',
          file: null
        });
        setPreview(null);

        if (onMintSuccess) {
          onMintSuccess(response.data.data);
        }
      }
    } catch (err) {
      console.error('Mint error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to mint NFT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
      <h2 className="text-3xl font-bold text-white mb-6">Mint New NFT</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">
            Upload File *
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*,audio/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              required
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center w-full h-40 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer hover:border-purple-500 transition"
            >
              {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-gray-400">Click to upload file</p>
                  <p className="text-sm text-gray-500">PNG, JPG, MP3, MP4</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* NFT Name */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">
            NFT Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            placeholder="Enter NFT name"
            required
          />
        </div>

        {/* NFT Type */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">
            NFT Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
            required
          >
            <option value="art">🎨 Art NFT</option>
            <option value="music">🎵 Music NFT</option>
            <option value="standard">💎 Standard NFT</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            placeholder="Describe your NFT..."
          />
        </div>

        {/* Purchasable Toggle */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="purchasable"
            checked={formData.purchasable}
            onChange={handleInputChange}
            className="w-5 h-5 rounded bg-slate-700 border-purple-500/30 text-purple-500 focus:ring-purple-500"
            id="purchasable"
          />
          <label htmlFor="purchasable" className="text-gray-300 font-medium cursor-pointer">
            Make this NFT purchasable
          </label>
        </div>

        {/* Price (conditional) */}
        {formData.purchasable && (
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Price (ALGO) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.000001"
              min="0"
              className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="0.00"
              required={formData.purchasable}
            />
            <p className="text-sm text-gray-400 mt-1">
              Platform fee: 2.5%
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !account}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Minting...' : account ? 'Mint NFT' : 'Connect Wallet First'}
        </button>
      </form>
    </div>
  );
}

export default MintForm;