// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const admin = require('../firebaseAdmin');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// ── Helper: resolve Firebase UID → { displayName, email } ─────────────────
// Returns "—" gracefully if user is deleted or UID is invalid
async function resolveFirebaseUser(uid) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return {
      displayName: userRecord.displayName || "—",
      email: userRecord.email || "—",
      photoURL: userRecord.photoURL || null,
    };
  } catch {
    return { displayName: "—", email: "—" };
  }
}

// ── Helper: get the start date based on the time range filter
// 'today'  -> start of today
// 'week'   -> last 7 days (including today)
// 'month'  -> last 30 days (including today)
const getStartDate = (range) => {
  const now = new Date();
  if (range === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  // For 'week' and 'month' return a start date N days before today (inclusive)
  const daysBack = range === 'week' ? 6 : 29; // 6 -> previous 6 days + today = 7 days; 29 -> 30 days
  const d = new Date(now);
  d.setDate(now.getDate() - daysBack);
  d.setHours(0, 0, 0, 0);
  return d;
};

// GET /api/dashboard?range=today|week|month
// Admin-only dashboard metrics
router.get('/', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const range = req.query.range || 'month';
    const startDate = getStartDate(range);

    // ── 1. KPI: Total Revenue & Total Orders ──────────────────────────────
    const orderStats = await Order.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: startDate } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalOrders: { $sum: 1 } } },
    ]);

    const totalRevenue = orderStats[0]?.totalRevenue || 0;
    const totalOrders = orderStats[0]?.totalOrders || 0;

    // ── 2. KPI: Total Unique Customers ────────────────────────────────────
    const uniqueCustomers = await Order.distinct('userId', {
      status: 'paid',
      createdAt: { $gte: startDate },
    });
    const totalCustomers = uniqueCustomers.length;

    // ── 3. KPI: Products Low on Stock ─────────────────────────────────────
    const LOW_STOCK_THRESHOLD = 10;
    const lowStockCount = await Product.countDocuments({
      stock: { $ne: null, $lt: LOW_STOCK_THRESHOLD },
    });

    // ── 4. Chart: Revenue Over Time ───────────────────────────────────────
    const revenueGroupFormat =
      range === 'today'
        ? { $dateToString: { format: '%H:00', date: '$createdAt' } }
        : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

    const revenueOverTime = await Order.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: startDate } } },
      { $group: { _id: revenueGroupFormat, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', revenue: 1 } },
    ]);

    // ── 5. Chart: Top 5 Selling Products ─────────────────────────────────
    const topProducts = await Order.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'productId',
          as: 'productInfo',
        },
      },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: { $arrayElemAt: ['$productInfo.name', 0] },
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // ── 6. Recent Orders — fetch raw, then enrich with Firebase user info ──
    const rawOrders = await Order.find({ status: 'paid' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('userId items total status createdAt paymentId')
      .lean();

    // Deduplicate userIds so we only call Firebase once per unique user
    // (multiple orders from the same user → one Admin SDK call)
    const uniqueUids = [...new Set(rawOrders.map(o => o.userId).filter(Boolean))];

    const userMap = {};
    await Promise.all(
      uniqueUids.map(async (uid) => {
        userMap[uid] = await resolveFirebaseUser(uid);
      })
    );

    // Attach customerName + customerEmail + customerPhoto to each order
    const recentOrders = rawOrders.map(order => ({
      ...order,
      customerName: userMap[order.userId]?.displayName ?? '—',
      customerEmail: userMap[order.userId]?.email ?? '—',
      customerPhoto: userMap[order.userId]?.photoURL ?? null,
    }));

    // ── Response ──────────────────────────────────────────────────────────
    res.json({
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
      recentOrders,   // each order now has customerName + customerEmail
    });

  } catch (err) {
    console.error('Dashboard route error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data' });
  }
});

module.exports = router;