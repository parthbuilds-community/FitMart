const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const resolveFirebaseUser = require("../lib/resolveFirebaseUser");

/* ─────────────────────────────────────────────
   SIMPLE IN-MEMORY CACHE (FIX FOR ISSUE #357)
──────────────────────────────────────────── */
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedUser(uid) {
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
    return null;
  }
}

/* ─────────────────────────────────────────────
   DATE RANGE HELPER
──────────────────────────────────────────── */
const getStartDate = (range) => {
  const now = new Date();

  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const daysBack = range === "week" ? 6 : 29;
  const d = new Date(now);
  d.setDate(now.getDate() - daysBack);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ─────────────────────────────────────────────
   DASHBOARD ROUTE
──────────────────────────────────────────── */
router.get(
  "/",
  verifyFirebaseToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const range = req.query.range || "month";
      const startDate = getStartDate(range);

      /* ─── KPIs ───────────────────────────── */
      const orderStats = await Order.aggregate([
        { $match: { status: "paid", createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
          },
        },
      ]);

      const totalRevenue = orderStats[0]?.totalRevenue || 0;
      const totalOrders = orderStats[0]?.totalOrders || 0;

      const uniqueCustomers = await Order.distinct("userId", {
        status: "paid",
        createdAt: { $gte: startDate },
      });

      const totalCustomers = uniqueCustomers.length;

      const LOW_STOCK_THRESHOLD = 10;

      const lowStockCount = await Product.countDocuments({
        stock: { $ne: null, $lt: LOW_STOCK_THRESHOLD },
      });

      /* ─── REVENUE OVER TIME ───────────────── */
      const revenueGroupFormat =
        range === "today"
          ? { $dateToString: { format: "%H:00", date: "$createdAt" } }
          : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

      const revenueOverTime = await Order.aggregate([
        { $match: { status: "paid", createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: revenueGroupFormat,
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", revenue: 1 } },
      ]);

      /* ─── TOP PRODUCTS ───────────────────── */
      const topProducts = await Order.aggregate([
        { $match: { status: "paid", createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "productId",
            as: "productInfo",
          },
        },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            name: { $arrayElemAt: ["$productInfo.name", 0] },
            totalQuantity: 1,
            totalRevenue: 1,
          },
        },
      ]);

      /* ─── RECENT ORDERS (WITH CACHED FIREBASE USERS) ─── */
      const rawOrders = await Order.find({ status: "paid" })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("userId items total status createdAt paymentId")
        .lean();

      const uniqueUids = [
        ...new Set(rawOrders.map((o) => o.userId).filter(Boolean)),
      ];

      const userMap = {};

      await Promise.all(
        uniqueUids.map(async (uid) => {
          userMap[uid] = await getCachedUser(uid);
        })
      );

      const recentOrders = rawOrders.map((order) => ({
        ...order,
        customerName: userMap[order.userId]?.displayName ?? "—",
        customerEmail: userMap[order.userId]?.email ?? "—",
        customerPhoto: userMap[order.userId]?.photoURL ?? null,
      }));

      /* ─── RESPONSE ───────────────────────── */
      return res.json({
        success: true,
        range,
        kpis: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          lowStockCount,
        },
        revenueOverTime,
        topProducts,
        recentOrders,
      });
    } catch (err) {
      console.error("Dashboard route error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to load dashboard data",
      });
    }
  }
);

module.exports = router;
