const SavingsGoal = require('../models/SavingsGoal');
const connectDB = require('../config/db');

// @desc    Get savings goals
// @route   GET /api/savings
exports.getSavingsGoals = async (req, res) => {
  try {
    await connectDB();
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create savings goal
// @route   POST /api/savings
exports.addSavingsGoal = async (req, res) => {
  try {
    await connectDB();
    const { title, targetAmount, currentAmount } = req.body;
    const target = parseFloat(targetAmount);

    if (!title || isNaN(target) || target <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid goal title and target amount' });
    }

    const goal = await SavingsGoal.create({
      userId: req.user._id,
      title,
      targetAmount: target,
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deposit into savings goal
// @route   PUT /api/savings/:id/deposit
exports.depositSavings = async (req, res) => {
  try {
    await connectDB();
    const { amount } = req.body;
    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
    }

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    goal.currentAmount += amt;
    await goal.save();

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings/:id
exports.deleteSavingsGoal = async (req, res) => {
  try {
    await connectDB();
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    await goal.deleteOne();
    res.json({ success: true, message: 'Savings goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
