const express = require("express");
const router = express.Router();

const Rewards = require("../models/Rewards");
const rewardsConfig = require("../config/rewardsConfig");
const { requireAuth } = require("../middleware/requireAuth");

function requireUserId(req) {
  return typeof req.user?.uid === "string" && req.user.uid.trim()
    ? req.user.uid.trim()
    : null;
}

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

router.get("/:userId", requireAuth, async (req, res) => {
  try {
    const authenticatedUserId = requireUserId(req);
    const userId = typeof req.params.userId === "string" ? req.params.userId.trim() : "";
    if (!authenticatedUserId) return res.status(401).json({ message: "Unauthorized" });
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (authenticatedUserId !== userId) {
      return res.status(403).json({ message: "Forbidden — you can only access your own rewards" });
    }
    const safeUserId = userId;

    let rewards = await Rewards.findOne({ userId: safeUserId });

    if (!rewards) {
      rewards = await Rewards.create({
        userId: safeUserId,
        pointsBalance: 0,
        transactions: [],
      });
    }

    const transactions = [...rewards.transactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      userId: rewards.userId,
      pointsBalance: rewards.pointsBalance,
      tier: getTier(rewards.pointsBalance),
      transactions,
    });
  } catch (error) {
    console.error("Get rewards error:", error);
    return res.status(500).json({ message: "Failed to fetch rewards" });
  }
});

router.post("/earn", requireAuth, async (req, res) => {
  try {
    const { userId, source, orderId, amount, description } = req.body;

    if (typeof userId !== "string" || !userId.trim() || typeof source !== "string") {
      return res.status(400).json({
        message: "userId and source are required",
      });
    }
    const authenticatedUserId = requireUserId(req);
    if (!authenticatedUserId) return res.status(401).json({ message: "Unauthorized" });
    const safeUserId = userId.trim();
    if (authenticatedUserId !== safeUserId) {
      return res.status(403).json({ message: "Forbidden — you can only earn rewards for yourself" });
    }
    if (orderId !== undefined && typeof orderId !== "string") {
      return res.status(400).json({ message: "orderId must be a string" });
    }
    const safeAmount = Number(amount);
    if (amount !== undefined && (!Number.isFinite(safeAmount) || safeAmount < 0)) {
      return res.status(400).json({ message: "amount must be a non-negative number" });
    }

    if (!["purchase", "workout", "milestone"].includes(source)) {
      return res.status(400).json({
        message: "Invalid rewards source",
      });
    }

    let rewards = await Rewards.findOne({ userId: safeUserId });

    if (!rewards) {
      rewards = await Rewards.create({
        userId: safeUserId,
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