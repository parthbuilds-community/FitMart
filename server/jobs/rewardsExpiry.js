// server/jobs/rewardsExpiry.js
// Daily cron job that expires FitRewards points older than 6 months.
// Uses FIFO accounting: redemptions are applied against the oldest earned
// transactions first, so only truly unspent points get expired.

const cron = require("node-cron");
const Rewards = require("../models/Rewards");
const rewardsConfig = require("../config/rewardsConfig");

/**
 * Calculate how many points from a specific earn transaction remain unspent,
 * using FIFO ordering (oldest points are redeemed first).
 *
 * @param {Array} transactions - Full sorted transactions array (oldest first)
 * @param {number} earnIndex   - Index of the earn transaction to check
 * @returns {number} Unredeemed points remaining for that transaction
 */
function getUnredeemedPoints(transactions, earnIndex) {
  const earnTx = transactions[earnIndex];
  if (earnTx.type !== "earned") return 0;

  // Sum all earned points from transactions at or before this index
  let totalEarnedUpToHere = 0;
  for (let i = 0; i <= earnIndex; i++) {
    if (transactions[i].type === "earned") {
      totalEarnedUpToHere += transactions[i].points;
    }
  }

  // Sum all redeemed + expired points across ALL transactions (they consume oldest first)
  let totalSpent = 0;
  for (const tx of transactions) {
    if (tx.type === "redeemed" || tx.type === "expired") {
      totalSpent += tx.points;
    }
  }

  // Points consumed from transactions up to and including this one
  const spentFromOlder = Math.min(totalSpent, totalEarnedUpToHere);

  // Points consumed from transactions strictly before this one
  let earnedBeforeThis = 0;
  for (let i = 0; i < earnIndex; i++) {
    if (transactions[i].type === "earned") {
      earnedBeforeThis += transactions[i].points;
    }
  }
  const spentFromBeforeThis = Math.min(totalSpent, earnedBeforeThis);

  // Points from THIS transaction that have been spent
  const spentFromThis = spentFromOlder - spentFromBeforeThis;

  return Math.max(0, earnTx.points - spentFromThis);
}

/**
 * Process point expiry for all users.
 * Finds earn transactions older than EXPIRY_MONTHS, calculates remaining
 * unspent points using FIFO, and creates "expired" debit entries.
 */
async function processExpiry() {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() - rewardsConfig.EXPIRY_MONTHS);

  console.log(`[RewardsExpiry] Running expiry job. Expiring points earned before ${expiryDate.toISOString()}`);

  // Find all users who have at least one earn transaction older than the expiry threshold
  const usersWithOldPoints = await Rewards.find({
    "transactions": {
      $elemMatch: {
        type: "earned",
        createdAt: { $lt: expiryDate },
      },
    },
  });

  let totalUsersProcessed = 0;
  let totalPointsExpired = 0;

  for (const rewards of usersWithOldPoints) {
    // Sort transactions by date (oldest first) for FIFO accounting
    const sorted = [...rewards.transactions].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    let pointsToExpire = 0;
    const expiredTxIds = [];

    for (let i = 0; i < sorted.length; i++) {
      const tx = sorted[i];
      if (tx.type !== "earned") continue;
      if (new Date(tx.createdAt) >= expiryDate) continue;

      // Check if this transaction was already expired in a previous run
      const alreadyExpired = sorted.some(
        (t) =>
          t.type === "expired" &&
          t.description &&
          t.description.includes(String(tx._id))
      );
      if (alreadyExpired) continue;

      const unredeemed = getUnredeemedPoints(sorted, i);
      if (unredeemed > 0) {
        pointsToExpire += unredeemed;
        expiredTxIds.push(String(tx._id));
      }
    }

    if (pointsToExpire <= 0) continue;

    // Atomically deduct expired points and add expiry transaction
    const updated = await Rewards.findOneAndUpdate(
      { _id: rewards._id, pointsBalance: { $gte: pointsToExpire } },
      {
        $inc: { pointsBalance: -pointsToExpire },
        $push: {
          transactions: {
            type: "expired",
            points: pointsToExpire,
            source: "purchase",
            description: `${pointsToExpire} points expired (6-month policy). Refs: ${expiredTxIds.join(", ")}`,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (updated) {
      totalUsersProcessed++;
      totalPointsExpired += pointsToExpire;
    } else {
      // Balance was less than expected (possibly concurrent redemption).
      // Expire only what's available.
      const current = await Rewards.findById(rewards._id);
      if (current && current.pointsBalance > 0) {
        const safeExpiry = Math.min(pointsToExpire, current.pointsBalance);
        await Rewards.findByIdAndUpdate(rewards._id, {
          $inc: { pointsBalance: -safeExpiry },
          $push: {
            transactions: {
              type: "expired",
              points: safeExpiry,
              source: "purchase",
              description: `${safeExpiry} points expired (6-month policy, adjusted). Refs: ${expiredTxIds.join(", ")}`,
              createdAt: new Date(),
            },
          },
        });
        totalUsersProcessed++;
        totalPointsExpired += safeExpiry;
      }
    }
  }

  console.log(
    `[RewardsExpiry] Complete. Users processed: ${totalUsersProcessed}, Points expired: ${totalPointsExpired}`
  );

  return { totalUsersProcessed, totalPointsExpired };
}

/**
 * Start the cron job scheduler.
 * Call this once from server/index.js after DB connection is established.
 */
function startExpiryCron() {
  const schedule = rewardsConfig.EXPIRY_CRON_SCHEDULE;

  cron.schedule(schedule, async () => {
    try {
      await processExpiry();
    } catch (err) {
      console.error("[RewardsExpiry] Cron job failed:", err.message);
    }
  });

  console.log(`[RewardsExpiry] Cron job scheduled: "${schedule}"`);
}

module.exports = { startExpiryCron, processExpiry };
