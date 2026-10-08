const mongoose = require('mongoose');

// The price the member actually agreed to. Stored on the membership (rather
// than read through `planId` at render time) so historical revenue, renewals
// and invoices stay stable when a program's price changes later.
const priceSnapshotSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    interval: { type: String, required: true },
    periodDays: { type: Number, required: true },
  },
  { _id: false }
);

// Schema structure only. ObjectId/bounds/date validators, the status-transition
// rules, the unique-active-membership constraint and the supporting indexes are
// tracked separately in #992.
const membershipSchema = new mongoose.Schema(
  {
    // Firebase UID, matching Cart, Order and UserProfile. The #991 draft
    // declared this as an ObjectId ref to a `User` model, but no such model
    // exists and the rest of the app identifies users by their Firebase UID
    // string, so an ObjectId could never hold a real `req.user.uid`.
    userId: { type: String, required: true },
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
    renewCount: { type: Number, default: 0 },
    priceSnapshot: { type: priceSnapshotSchema, required: true },
    currentDayIndex: { type: Number, default: 0 },
    startedAt: { type: Date },
    enrolledAt: { type: Date },
    cancelledAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Membership', membershipSchema);
