const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const connectDB = require('../config/db');

// @desc    Get user transactions with optional filter
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    await connectDB();
    const { category, walletId, type, startDate, endDate, search } = req.query;

    let query = { userId: req.user._id };

    if (category && category !== 'all') query.category = category;
    if (walletId && walletId !== 'all') query.walletId = walletId;
    if (type && type !== 'all') query.type = type;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    console.error('[transactionController] getTransactions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new transaction & update wallet balance automatically
// @route   POST /api/transactions
exports.addTransaction = async (req, res) => {
  try {
    await connectDB();
    const { title, amount, type, category, walletId, date, note, flagged } = req.body;
    const amt = parseFloat(amount);

    if (!title || isNaN(amt) || !type || !walletId) {
      return res.status(400).json({ success: false, message: 'Please provide title, amount, type, and wallet' });
    }

    const tx = await Transaction.create({
      userId: req.user._id,
      title,
      amount: amt,
      type,
      category: category || 'cat_transit',
      walletId: walletId || 'cash',
      date: date || new Date().toISOString().split('T')[0],
      note: note || '',
      flagged: Boolean(flagged)
    });

    // Update wallet balance automatically
    const wallet = await Wallet.findOne({ userId: req.user._id, walletId: tx.walletId });
    if (wallet) {
      if (type === 'expense') {
        wallet.balance = Math.max(0, wallet.balance - amt);
      } else {
        wallet.balance += amt;
      }
      await wallet.save();
    }

    res.status(201).json({ success: true, data: tx, updatedWallet: wallet });
  } catch (error) {
    console.error('[transactionController] addTransaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete transaction & revert wallet balance
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    await connectDB();
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Revert wallet balance
    const wallet = await Wallet.findOne({ userId: req.user._id, walletId: tx.walletId });
    if (wallet) {
      if (tx.type === 'expense') {
        wallet.balance += tx.amount;
      } else {
        wallet.balance = Math.max(0, wallet.balance - tx.amount);
      }
      await wallet.save();
    }

    await tx.deleteOne();

    res.json({ success: true, message: 'Transaction removed', revertedWallet: wallet });
  } catch (error) {
    console.error('[transactionController] deleteTransaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get summary statistics
// @route   GET /api/transactions/summary
exports.getSummary = async (req, res) => {
  try {
    await connectDB();
    const transactions = await Transaction.find({ userId: req.user._id });
    const wallets = await Wallet.find({ userId: req.user._id });
    const user = await User.findById(req.user._id);

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    let netBalance = 0;
    wallets.forEach(w => {
      netBalance += w.balance;
    });

    const budget = user.monthlyBudget || totalIncome || 0;
    const budgetUsedPercent = budget > 0 ? Math.min(Math.round((totalExpense / budget) * 100), 100) : 0;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance,
        budget,
        budgetUsedPercent
      }
    });
  } catch (error) {
    console.error('[transactionController] getSummary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
