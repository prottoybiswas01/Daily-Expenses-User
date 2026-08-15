const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1
    },
    currentAmount: {
      type: Number,
      default: 0
    },
    dateCreated: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    }
  },
  { timestamps: true }
);

savingsGoalSchema.index({ userId: 1 });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
