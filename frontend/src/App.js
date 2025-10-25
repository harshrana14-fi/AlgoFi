import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './views/Home';
import Marketplace from './views/Marketplace';
import Portfolio from './views/Portfolio';

function App() {
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Connect wallet function
  const connectWallet = async () => {
    setLoading(true);
    try {
      // Check if PeraWallet is available
      if (window.PeraWallet) {
        const peraWallet = window.PeraWallet;
        await peraWallet.connect();
        const accounts = await peraWallet.connector.accounts;
        
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
          localStorage.setItem('walletAddress', accounts[0]);
        }
      } else {
        alert('Please install Pera Wallet extension');
        window.open('https://perawallet.app/', '_blank');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setConnected(false);
    localStorage.removeItem('walletAddress');
    if (window.PeraWallet) {
      window.PeraWallet.disconnect();
    }
  };

  // Check for previously connected wallet
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress && window.PeraWallet) {
      setAccount(savedAddress);
      setConnected(true);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header 
          account={account}
          connected={connected}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          loading={loading}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={<Home account={account} connected={connected} />} 
            />
            <Route 
              path="/marketplace" 
              element={<Marketplace account={account} connected={connected} />} 
            />
            <Route 
              path="/portfolio" 
              element={<Portfolio account={account} connected={connected} />} 
            />
          </Routes>
        </main>

        <footer className="bg-slate-900/50 backdrop-blur-lg border-t border-purple-500/20 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">AlgoFi</h3>
                <p className="text-gray-400">
                  Decentralized NFT marketplace on Algorand for artists, musicians, and creators.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="/" className="text-gray-400 hover:text-purple-400 transition">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/marketplace" className="text-gray-400 hover:text-purple-400 transition">
                      Marketplace
                    </a>
                  </li>
                  <li>
                    <a href="/portfolio" className="text-gray-400 hover:text-purple-400 transition">
                      Portfolio
                    </a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="https://developer.algorand.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-400 transition"
                    >
                      Algorand Docs
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://testnet.algoexplorer.io/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-400 transition"
                    >
                      TestNet Explorer
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://bank.testnet.algorand.network/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-400 transition"
                    >
                      TestNet Dispenser
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-purple-500/20 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 AlgoFi. Built on Algorand TestNet. 
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;