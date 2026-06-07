// server/jobs/pointsExpiry.js
// Cron job that runs daily at midnight to expire FitRewards points older than 6 months.
// Uses FIFO (First In, First Out) logic: the oldest earned points are spent first,
// so any unconsumed portion of earn transactions older than 6 months gets expired.

const cron = require("node-cron");
const Rewards = require("../models/Rewards");

const EXPIRY_DAYS = 183; // ~6 months (365 / 2)

/**
 * Determine if an earn transaction's remaining (unspent) points should be
 * expired.  Uses a FIFO approach:
 *
 *   1. For each user, collect all "earned" transactions (sorted oldest first).
 *   2. Sum all "redeemed" transactions + previously "expired" debits.
 *   3. Walk through earns FIFO, subtracting consumed amounts.
 *   4. Any unconsumed portion of an earn older than 6 months → create an
 *      "expiry" debit that deducts from the user's balance.
 */
async function expireOldPoints() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - EXPIRY_DAYS);

  // We process in batches to avoid holding all users in memory at once.
  const BATCH_SIZE = 50;
  let processed = 0;
  let expiredCount = 0;
  let totalExpiredPoints = 0;

  while (true) {
    const users = await Rewards.find({})
      .sort({ userId: 1 })
      .skip(processed)
      .limit(BATCH_SIZE)
      .lean();

    if (users.length === 0) break;
    processed += users.length;

    for (const user of users) {
      const { expiryCount, expiryPoints } = await processUser(user, cutoff);
      if (expiryCount > 0) {
        expiredCount += expiryCount;
        totalExpiredPoints += expiryPoints;
      }
    }

    console.log(
      `[PointsExpiry] Processed ${processed} users so far...`
    );
  }

  console.log(
    `[PointsExpiry] Done. Expired points for ${expiredCount} users, ` +
    `total ${totalExpiredPoints} points expired.`
  );
}

/**
 * Process a single user's ledger. Returns the number of expired points.
 */
async function processUser(user, cutoff) {
  if (!user.transactions || user.transactions.length === 0) {
    return { expiryCount: 0, expiryPoints: 0 };
  }

  // 1. Sort earn transactions oldest-first (FIFO).
  const earns = user.transactions
    .filter((t) => t.type === "earned")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (earns.length === 0) return { expiryCount: 0, expiryPoints: 0 };

  // 2. Sum all consumed points (redemptions + previous expiries).
  const totalConsumed = user.transactions
    .filter(
      (t) => t.type === "redeemed" || t.source === "expiry"
    )
    .reduce((sum, t) => sum + (t.points || 0), 0);

  // 3. Walk earns FIFO, tracking how much has been consumed.
  let remainingToConsume = totalConsumed;
  const expirations = [];

  for (const earn of earns) {
    const consumedFromThisEarn = Math.min(earn.points, remainingToConsume);
    remainingToConsume -= consumedFromThisEarn;
    const unconsumed = earn.points - consumedFromThisEarn;

    // If the earn is older than the cutoff and still has unspent points, expire them.
    if (
      unconsumed > 0 &&
      new Date(earn.createdAt) < cutoff
    ) {
      expirations.push({
        type: "redeemed",
        points: unconsumed,
        source: "expiry",
        description: `Points expired — earned on ${new Date(earn.createdAt).toLocaleDateString("en-IN")}`,
        createdAt: new Date(),
      });
    }
  }

  if (remainingToConsume > 0) {
    console.warn(
      `[PointsExpiry] User ${user.userId}: more points consumed ` +
      `(${totalConsumed}) than earned — possible data inconsistency.`
    );
  }

  if (expirations.length === 0) return { expiryCount: 0, expiryPoints: 0 };

  // 4. Apply the expiry debits to the user's document.
  const totalExpiryPoints = expirations.reduce((s, e) => s + e.points, 0);

  await Rewards.updateOne(
    { _id: user._id },
    {
      $push: { transactions: { $each: expirations } },
      $inc: { pointsBalance: -totalExpiryPoints },
    }
  );

  return { expiryCount: expirations.length, expiryPoints: totalExpiryPoints };
}

/**
 * Schedule the cron job to run daily at midnight (00:00).
 * Uses the server's local timezone.
 */
function schedulePointsExpiry() {
  // "0 0 * * *" = every day at 00:00
  const job = cron.schedule(
    "0 0 * * *",
    () => {
      console.log("[PointsExpiry] Running daily points expiry check...");
      expireOldPoints().catch((err) => {
        console.error("[PointsExpiry] Error during expiry run:", err);
      });
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  console.log("[PointsExpiry] Cron job scheduled for daily midnight (IST).");
  return job;
}

module.exports = { schedulePointsExpiry, expireOldPoints };
