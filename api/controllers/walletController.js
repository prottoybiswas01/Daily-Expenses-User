const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const connectDB = require('../config/db');

const DEFAULT_WALLETS = [
  { walletId: 'bkash', name: 'bKash (বিকাশ)', balance: 0, icon: 'fa-mobile-alt', color: '#e2136e' },
  { walletId: 'nagad', name: 'Nagad (নগদ)', balance: 0, icon: 'fa-wallet', color: '#f7921e' },
  { walletId: 'bank', name: 'Bank Account (ব্যাংক)', balance: 0, icon: 'fa-university', color: '#2563eb' },
  { walletId: 'cash', name: 'Cash in Hand (নগদ ক্যাশ)', balance: 0, icon: 'fa-money-bill-wave', color: '#10b981' }
];

// @desc    Get user wallets
// @route   GET /api/wallets
exports.getWallets = async (req, res) => {
  try {
    await connectDB();
    let wallets = await Wallet.find({ userId: req.user._id }).lean();

    // If user has no wallets, create defaults
    if (wallets.length === 0) {
      wallets = await Promise.all(
        DEFAULT_WALLETS.map(w => Wallet.create({ userId: req.user._id, ...w }))
      );
    }

    res.json({ success: true, data: wallets });
  } catch (error) {
    console.error('[walletController] getWallets error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Top up wallet balance & add income log
// @route   POST /api/wallets/topup
exports.topUpWallet = async (req, res) => {
  try {
    await connectDB();
    const { walletId, amount, sourceName, newBudget } = req.body;
    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid top up amount' });
    }

    let wallet = await Wallet.findOne({ userId: req.user._id, walletId });
    if (!wallet) {
      const def = DEFAULT_WALLETS.find(w => w.walletId === walletId) || {
        walletId, name: walletId.toUpperCase(), balance: 0, icon: 'fa-wallet', color: '#10b981'
      };
      wallet = await Wallet.create({ userId: req.user._id, ...def });
    }

    wallet.balance += amt;
    await wallet.save();

    // Create Income Transaction record
    const walletNames = { bkash: 'bKash', nagad: 'Nagad', bank: 'Bank Account', cash: 'Cash in Hand' };
    const tx = await Transaction.create({
      userId: req.user._id,
      title: `Deposit / Top Up: ${walletNames[walletId] || walletId} (${sourceName || 'Family Allowance'})`,
      amount: amt,
      type: 'income',
      category: 'cat_allowance',
      walletId,
      date: new Date().toISOString().split('T')[0],
      method: walletNames[walletId] || walletId,
      note: 'Added money to wallet'
    });

    if (newBudget !== undefined && !isNaN(parseFloat(newBudget))) {
      await User.findByIdAndUpdate(req.user._id, { monthlyBudget: parseFloat(newBudget) });
    }

    res.json({
      success: true,
      wallet,
      transaction: tx
    });
  } catch (error) {
    console.error('[walletController] topUp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Transfer money between wallets
// @route   POST /api/wallets/transfer
exports.transferWallets = async (req, res) => {
  try {
    await connectDB();
    const { fromWalletId, toWalletId, amount } = req.body;
    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer amount' });
    }
    if (fromWalletId === toWalletId) {
      return res.status(400).json({ success: false, message: 'Source and target wallets must be different' });
    }

    const fromWallet = await Wallet.findOne({ userId: req.user._id, walletId: fromWalletId });
    const toWallet = await Wallet.findOne({ userId: req.user._id, walletId: toWalletId });

    if (!fromWallet || !toWallet) {
      return res.status(404).json({ success: false, message: 'One or both wallets not found' });
    }

    if (fromWallet.balance < amt) {
      return res.status(400).json({ success: false, message: 'Insufficient balance in source wallet' });
    }

    fromWallet.balance -= amt;
    toWallet.balance += amt;

    await fromWallet.save();
    await toWallet.save();

    // Log internal transfer transaction
    const tx = await Transaction.create({
      userId: req.user._id,
      title: `Transfer: ${fromWallet.name.split(' (')[0]} → ${toWallet.name.split(' (')[0]}`,
      amount: amt,
      type: 'expense',
      category: 'cat_transit',
      walletId: fromWalletId,
      date: new Date().toISOString().split('T')[0],
      method: fromWallet.name.split(' (')[0],
      note: 'Internal wallet transfer'
    });

    res.json({
      success: true,
      fromWallet,
      toWallet,
      transaction: tx
    });
  } catch (error) {
    console.error('[walletController] transfer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
