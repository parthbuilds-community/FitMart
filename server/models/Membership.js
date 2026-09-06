const mongoose = require('mongoose');

const priceSnapshotSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    interval: {
      type: String,
      required: true,
    },
    periodDays: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'expired', 'trialing'],
      required: true,
    },
    renewCount: {
      type: Number,
      default: 0,
    },
    priceSnapshot: {
      type: priceSnapshotSchema,
      required: true,
    },
    currentDayIndex: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    enrolledAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Membership', membershipSchema);