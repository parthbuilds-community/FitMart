const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const UserProfile = require("../models/UserProfile");

const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const sendInactivityReminderEmail =
  require("../services/inactiveCustomerEmailService").sendInactivityReminderEmail;

const resolveFirebaseUser = require("../lib/resolveFirebaseUser");

/* ─────────────────────────────────────────────
   GLOBAL FIREBASE USER CACHE (FIX #357)
──────────────────────────────────────────── */
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedFirebaseUser(uid) {
  if (!uid) return null;

  const cached = userCache.get(uid);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const data = await resolveFirebaseUser(uid);

    userCache.set(uid, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (err) {
    console.error("Firebase user fetch failed:", err.message);
    return {
      displayName: "—",
      email: "—",
      photoURL: null,
    };
  }
}

/* ─────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────── */
function getSegment(orderCount, totalSpend) {
  if (orderCount >= 5 || totalSpend >= 50000) return "high-value";
  if (orderCount >= 2) return "returning";
  return "new";
}

function calculateInactivityInfo(lastOrderDate) {
  if (!lastOrderDate) {
    return {
      daysSinceLastOrder: null,
      eligibleForReminder: false,
    };
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(lastOrderDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return {
    daysSinceLastOrder: daysSince,
    eligibleForReminder: daysSince >= 30,
  };
}

/* ─────────────────────────────────────────────
   GET ALL CUSTOMERS
──────────────────────────────────────────── */
router.get("/", verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const customers = await Order.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpend: { $sum: "$total" },
          firstOrder: { $min: "$createdAt" },
          lastOrder: { $max: "$createdAt" },
        },
      },
      { $sort: { totalSpend: -1 } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          orderCount: 1,
          totalSpend: 1,
          firstOrder: 1,
          lastOrder: 1,
        },
      },
    ]);

    if (!customers.length) {
      return res.json({ success: true, data: [] });
    }

    const uniqueUids = [
      ...new Set(customers.map((c) => c.userId).filter(Boolean)),
    ];

    const userMap = {};
    const profileMap = {};

    await Promise.all(
      uniqueUids.map(async (uid) => {
        userMap[uid] = await getCachedFirebaseUser(uid);
        profileMap[uid] = await UserProfile.findOne({ userId: uid });
      })
    );

    const result = customers.map((c) => {
      const inactivityInfo = calculateInactivityInfo(c.lastOrder);

      return {
        ...c,
        segment: getSegment(c.orderCount, c.totalSpend),
        customerName: userMap[c.userId]?.displayName ?? "—",
        customerEmail: userMap[c.userId]?.email ?? "—",
        customerPhoto: userMap[c.userId]?.photoURL ?? null,
        daysSinceLastOrder: inactivityInfo.daysSinceLastOrder,
        eligibleForReminder: inactivityInfo.eligibleForReminder,
        lastReminderEmailSentAt:
          profileMap[c.userId]?.lastReminderEmailSentAt ?? null,
      };
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("GET /customers error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error",
    });
  }
});

/* ─────────────────────────────────────────────
   GET SINGLE CUSTOMER
──────────────────────────────────────────── */
router.get(
  "/:userId",
  verifyFirebaseToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const orders = await Order.find({
        userId,
        status: "paid",
      }).sort({ createdAt: -1 });

      if (!orders.length) {
        return res.status(404).json({
          success: false,
          error: "Customer not found",
        });
      }

      const orderCount = orders.length;
      const totalSpend = orders.reduce((s, o) => s + o.total, 0);

      const firstOrder = orders[orders.length - 1].createdAt;
      const lastOrder = orders[0].createdAt;

      const segment = getSegment(orderCount, totalSpend);
      const inactivityInfo = calculateInactivityInfo(lastOrder);

      const profile = await UserProfile.findOne({ userId });

      const firebaseUser = await getCachedFirebaseUser(userId);

      return res.json({
        success: true,
        data: {
          userId,
          customerName: firebaseUser?.displayName ?? "—",
          customerEmail: firebaseUser?.email ?? "—",
          customerPhoto: firebaseUser?.photoURL ?? null,
          orderCount,
          totalSpend,
          firstOrder,
          lastOrder,
          segment,
          daysSinceLastOrder: inactivityInfo.daysSinceLastOrder,
          eligibleForReminder: inactivityInfo.eligibleForReminder,
          lastReminderEmailSentAt:
            profile?.lastReminderEmailSentAt ?? null,
          orders,
        },
      });
    } catch (err) {
      console.error("Customer detail error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Server error",
      });
    }
  }
);

/* ─────────────────────────────────────────────
   SEND REMINDER EMAIL
──────────────────────────────────────────── */
router.post(
  "/:userId/send-reminder",
  verifyFirebaseToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await sendInactivityReminderEmail(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error("send-reminder error:", err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

module.exports = router;
