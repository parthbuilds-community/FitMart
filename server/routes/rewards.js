const express = require("express");
const router = express.Router();

const Rewards = require("../models/Rewards");
const rewardsConfig = require("../config/rewardsConfig");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");

function getTier(points) {
  let currentTier = rewardsConfig.TIERS[0];

  for (const tier of rewardsConfig.TIERS) {
    if (points >= tier.minPoints) {
      currentTier = tier;
    }
  }

  return currentTier.name;
}

function calculatePoints(source, amount = 0) {
  if (source === "purchase") {
    return Math.floor(Number(amount || 0) * rewardsConfig.POINTS_PER_RUPEE);
  }

  if (source === "workout") {
    return rewardsConfig.WORKOUT_POINTS;
  }

  if (source === "milestone") {
    return rewardsConfig.MILESTONE_POINTS;
  }

  return 0;
}

router.get("/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { cursor, limit: queryLimit } = req.query;
    const limit = Math.min(Math.max(parseInt(queryLimit) || 20, 1), 100);

    let rewards = await Rewards.findOne({ userId });

    if (!rewards) {
      rewards = await Rewards.create({
        userId,
        pointsBalance: 0,
        transactions: [],
      });
    }

    // Sort transactions newest-first
    const sorted = [...rewards.transactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Cursor-based pagination: find the index after the cursor transaction
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = sorted.findIndex(
        (t) => t._id && t._id.toString() === cursor
      );
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const pagedTransactions = sorted.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < sorted.length;
    const nextCursor =
      pagedTransactions.length > 0
        ? pagedTransactions[pagedTransactions.length - 1]._id.toString()
        : null;

    return res.status(200).json({
      userId: rewards.userId,
      pointsBalance: rewards.pointsBalance,
      tier: getTier(rewards.pointsBalance),
      transactions: pagedTransactions,
      pagination: {
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("Get rewards error:", error);
    return res.status(500).json({ message: "Failed to fetch rewards" });
  }
});

router.post("/earn", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId, source, orderId, amount, description } = req.body;

    if (!userId || !source) {
      return res.status(400).json({
        message: "userId and source are required",
      });
    }

    if (!["purchase", "workout", "milestone"].includes(source)) {
      return res.status(400).json({
        message: "Invalid rewards source",
      });
    }

    let rewards = await Rewards.findOne({ userId });

    if (!rewards) {
      rewards = await Rewards.create({
        userId,
        pointsBalance: 0,
        transactions: [],
      });
    }

    if (source === "purchase" && orderId) {
      const alreadyCredited = rewards.transactions.some(
        (transaction) => transaction.orderId === orderId
      );

      if (alreadyCredited) {
        return res.status(200).json({
          success: true,
          message: "Rewards already credited for this order",
          pointsBalance: rewards.pointsBalance,
          tier: getTier(rewards.pointsBalance),
        });
      }
    }

    let points = calculatePoints(source, amount);

    if (source === "purchase" && rewards.transactions.length === 0) {
      points += rewardsConfig.FIRST_PURCHASE_BONUS;
    }

    const transaction = {
      type: "earned",
      points,
      source,
      orderId,
      description: description || `Points earned from ${source}`,
      createdAt: new Date(),
    };

    rewards.transactions.push(transaction);
    rewards.pointsBalance += points;

    await rewards.save();

    return res.status(200).json({
      success: true,
      pointsEarned: points,
      pointsBalance: rewards.pointsBalance,
      tier: getTier(rewards.pointsBalance),
      transaction,
    });
  } catch (error) {
    console.error("Earn rewards error:", error);
    return res.status(500).json({ message: "Failed to earn rewards" });
  }
});

module.exports = router;