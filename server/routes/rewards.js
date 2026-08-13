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

    let rewards = await Rewards.findOne({ userId });

    if (!rewards) {
      rewards = await Rewards.create({
        userId,
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

/**
 * @route   POST /redeem
 * @desc    Deducts points from user's balance for a checkout discount;
 *          body: { userId, points, orderId, orderTotal }
 * @access  Private
 */
router.post("/redeem", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId, points, orderId, orderTotal } = req.body;

    if (!userId || !points) {
      return res.status(400).json({ message: "userId and points are required" });
    }

    const pointsToRedeem = Math.floor(Number(points));
    if (pointsToRedeem <= 0) {
      return res.status(400).json({ message: "Points must be a positive number" });
    }

    if (pointsToRedeem < rewardsConfig.MIN_POINTS_TO_REDEEM) {
      return res.status(400).json({
        message: `Minimum ${rewardsConfig.MIN_POINTS_TO_REDEEM} points required to redeem`,
      });
    }

    let rewards = await Rewards.findOne({ userId });
    if (!rewards || rewards.pointsBalance < pointsToRedeem) {
      return res.status(400).json({ message: "Insufficient points balance" });
    }

    // Calculate discount value and cap at MAX_REDEMPTION_PERCENT of order total
    const discountValue = Math.floor(pointsToRedeem * rewardsConfig.RUPEES_PER_POINT);
    const maxDiscount = Math.floor((orderTotal || Infinity) * rewardsConfig.MAX_REDEMPTION_PERCENT / 100);
    const actualDiscount = Math.min(discountValue, maxDiscount);
    const actualPointsUsed = Math.ceil(actualDiscount / rewardsConfig.RUPEES_PER_POINT);

    // Deduct points atomically
    const updated = await Rewards.findOneAndUpdate(
      { userId, pointsBalance: { $gte: actualPointsUsed } },
      {
        $inc: { pointsBalance: -actualPointsUsed },
        $push: {
          transactions: {
            type: "redeemed",
            points: actualPointsUsed,
            source: "purchase",
            orderId: orderId || null,
            description: `Redeemed ${actualPointsUsed} points for ₹${actualDiscount} discount`,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ message: "Insufficient points balance" });
    }

    return res.status(200).json({
      success: true,
      pointsRedeemed: actualPointsUsed,
      discountAmount: actualDiscount,
      pointsBalance: updated.pointsBalance,
      tier: getTier(updated.pointsBalance),
    });
  } catch (error) {
    console.error("Redeem rewards error:", error);
    return res.status(500).json({ message: "Failed to redeem points" });
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