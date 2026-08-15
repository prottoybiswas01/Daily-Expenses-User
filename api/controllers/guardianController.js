const SharedLink = require('../models/SharedLink');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const connectDB = require('../config/db');

// @desc    Generate a new Guardian Observer access code
// @route   POST /api/guardian/generate
exports.generateSharedLink = async (req, res) => {
  try {
    await connectDB();
    const { recipientEmail, recipientName } = req.body;

    if (!recipientEmail || !recipientName) {
      return res.status(400).json({ success: false, message: 'Recipient name and email are required' });
    }

    const accessCode = 'REF-' + Math.floor(100000 + Math.random() * 900000);

    const sharedLink = await SharedLink.create({
      userId: req.user._id,
      accessCode,
      recipientEmail,
      recipientName,
      status: 'Active',
      permission: 'Read-Only Observer'
    });

    res.status(201).json({ success: true, data: sharedLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active shared links for current user
// @route   GET /api/guardian/links
exports.getSharedLinks = async (req, res) => {
  try {
    await connectDB();
    const links = await SharedLink.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke shared link
// @route   DELETE /api/guardian/links/:id
exports.revokeSharedLink = async (req, res) => {
  try {
    await connectDB();
    const link = await SharedLink.findOne({ _id: req.params.id, userId: req.user._id });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Shared link not found' });
    }
    link.status = 'Revoked';
    await link.save();
    res.json({ success: true, message: 'Access revoked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Public endpoint for Guardian Observer mode verification
// @route   GET /api/guardian/view/:accessCode
exports.getGuardianViewData = async (req, res) => {
  try {
    await connectDB();
    const { accessCode } = req.params;

    const link = await SharedLink.findOne({ accessCode, status: 'Active' });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Invalid or revoked reference access code' });
    }

    const studentUser = await User.findById(link.userId).select('name email monthlyBudget currency');
    if (!studentUser) {
      return res.status(404).json({ success: false, message: 'Student account not found' });
    }

    const transactions = await Transaction.find({ userId: studentUser._id }).sort({ date: -1 });
    const wallets = await Wallet.find({ userId: studentUser._id });

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    let netBalance = 0;
    wallets.forEach(w => netBalance += w.balance);

    res.json({
      success: true,
      guardianName: link.recipientName,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        monthlyBudget: studentUser.monthlyBudget
      },
      wallets,
      transactions
    });
  } catch (error) {
    console.error('[guardianController] getGuardianViewData error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
