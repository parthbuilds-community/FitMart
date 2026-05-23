const mongoose = require("mongoose");

const rewardTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["earned", "redeemed"],
      default: "earned",
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ["purchase", "workout", "milestone"],
      required: true,
    },
    orderId: {
      type: String,
    },
    description: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const rewardsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pointsBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [rewardTransactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rewards", rewardsSchema);