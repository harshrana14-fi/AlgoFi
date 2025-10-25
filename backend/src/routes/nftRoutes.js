const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nftController');

// Account routes
router.get('/account/:address', nftController.getAccount);

// NFT operations
router.post('/mint', nftController.mintNFT);
router.post('/list', nftController.listNFT);
router.post('/buy', nftController.buyNFT);
router.get('/details/:assetId', nftController.getNFTDetails);

// Transaction operations
router.post('/submit', nftController.submitTransaction);
router.post('/opt-in', nftController.optIn);

// Marketplace
router.get('/marketplace', nftController.getMarketplace);

module.exports = router;