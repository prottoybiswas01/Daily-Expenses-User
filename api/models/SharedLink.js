const mongoose = require('mongoose');

const sharedLinkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    accessCode: {
      type: String,
      required: true,
      unique: true
    },
    recipientEmail: {
      type: String,
      required: true
    },
    recipientName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Revoked'],
      default: 'Active'
    },
    permission: {
      type: String,
      default: 'Read-Only Observer'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SharedLink', sharedLinkSchema);
