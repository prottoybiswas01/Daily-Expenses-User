const express = require('express');
const router = express.Router();
const { getWallets, topUpWallet, transferWallets } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWallets);
router.post('/topup', protect, topUpWallet);
router.post('/transfer', protect, transferWallets);

module.exports = router;
