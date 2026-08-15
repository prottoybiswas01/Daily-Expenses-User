const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const connectDB = require('../config/db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'daily_expenses_jwt_secret_key_2026_bd', {
    expiresIn: '30d'
  });
};

const DEFAULT_WALLETS = [
  { walletId: 'bkash', name: 'bKash (বিকাশ)', balance: 0, icon: 'fa-mobile-alt', color: '#e2136e' },
  { walletId: 'nagad', name: 'Nagad (নগদ)', balance: 0, icon: 'fa-wallet', color: '#f7921e' },
  { walletId: 'bank', name: 'Bank Account (ব্যাংক)', balance: 0, icon: 'fa-university', color: '#2563eb' },
  { walletId: 'cash', name: 'Cash in Hand (নগদ ক্যাশ)', balance: 0, icon: 'fa-money-bill-wave', color: '#10b981' }
];

// @desc    Register a new student user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    await connectDB();
    const { name, email, password, monthlyBudget } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : 0
    });

    // Create default wallets for user
    const walletPromises = DEFAULT_WALLETS.map(w =>
      Wallet.create({ userId: user._id, ...w })
    );
    await Promise.all(walletPromises);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency,
        theme: user.theme
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('[authController] Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency,
        theme: user.theme
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('[authController] Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Demo Login for instant evaluation
// @route   POST /api/auth/demo
exports.demoLogin = async (req, res) => {
  try {
    await connectDB();
    const demoEmail = 'tanvir.cs@university.edu';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: 'Tanvir Hossain',
        email: demoEmail,
        password: 'demopassword123',
        monthlyBudget: 15000,
        role: 'student'
      });

      // Initialize wallets with default balances for Demo user
      const demoWallets = [
        { walletId: 'bkash', name: 'bKash (বিকাশ)', balance: 4500, icon: 'fa-mobile-alt', color: '#e2136e' },
        { walletId: 'nagad', name: 'Nagad (নগদ)', balance: 2200, icon: 'fa-wallet', color: '#f7921e' },
        { walletId: 'bank', name: 'Bank Account (ব্যাংক)', balance: 8000, icon: 'fa-university', color: '#2563eb' },
        { walletId: 'cash', name: 'Cash in Hand (নগদ ক্যাশ)', balance: 1300, icon: 'fa-money-bill-wave', color: '#10b981' }
      ];

      await Promise.all(demoWallets.map(w => Wallet.create({ userId: user._id, ...w })));
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        monthlyBudget: user.monthlyBudget,
        currency: user.currency,
        theme: user.theme
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('[authController] Demo login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    await connectDB();
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile & settings
// @route   PUT /api/auth/settings
exports.updateSettings = async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.monthlyBudget !== undefined) user.monthlyBudget = parseFloat(req.body.monthlyBudget);
    if (req.body.theme) user.theme = req.body.theme;
    if (req.body.currency) user.currency = req.body.currency;

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        monthlyBudget: updatedUser.monthlyBudget,
        currency: updatedUser.currency,
        theme: updatedUser.theme
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
