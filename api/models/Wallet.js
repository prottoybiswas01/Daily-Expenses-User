const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    walletId: {
      type: String,
      enum: ['bkash', 'nagad', 'bank', 'cash'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    balance: {
      type: Number,
      default: 0
    },
    icon: {
      type: String,
      default: 'fa-wallet'
    },
    color: {
      type: String,
      default: '#10b981'
    }
  },
  { timestamps: true }
);

walletSchema.index({ userId: 1, walletId: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', walletSchema);
