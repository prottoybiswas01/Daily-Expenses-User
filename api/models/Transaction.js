const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be non-negative']
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },
    category: {
      type: String,
      required: true,
      default: 'cat_transit'
    },
    walletId: {
      type: String,
      enum: ['bkash', 'nagad', 'bank', 'cash'],
      required: true,
      default: 'cash'
    },
    date: {
      type: String,
      required: true
    },
    method: {
      type: String,
      default: 'Cash'
    },
    note: {
      type: String,
      default: ''
    },
    flagged: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
