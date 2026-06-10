// server/routes/customers.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const UserProfile = require('../models/UserProfile');
const admin = require('../firebaseAdmin');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const { sendInactivityReminderEmail } = require('../services/inactiveCustomerEmailService');
const resolveFirebaseUser = require('../lib/resolveFirebaseUser');

// ── Segmentation logic ─────────────────────────────────────────────────────
function getSegment(orderCount, totalSpend) {
  if (orderCount >= 5 || totalSpend >= 50000) return 'high-value';
  if (orderCount >= 2) return 'returning';
  return 'new';
}

// ── Inactivity helper ──────────────────────────────────────────────────────
function calculateInactivityInfo(lastOrderDate) {
  if (!lastOrderDate) {
    return {
      daysSinceLastOrder: null,
      eligibleForReminder: false,
    };
  }

  const daysSince = Math.floor(
    (Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    daysSinceLastOrder: daysSince,
    eligibleForReminder: daysSince >= 30,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers
// All customers aggregated from orders, enriched with Firebase user info
// Admin-only access to protect customer PII
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;

    // Aggregate every paid-order customer. This stage is cheap (one row per
    // customer). The expensive part is the per-customer Firebase lookup below,
    // which we now only run for the requested page instead of every customer.
    const allCustomers = await Order.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpend: { $sum: '$total' },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' },
        },
      },
      { $sort: { totalSpend: -1 } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          orderCount: 1,
          totalSpend: 1,
          firstOrder: 1,
          lastOrder: 1,
        },
      },
    ]);

    const total = allCustomers.length;

    // Segment counts are computed across ALL customers (no Firebase needed) so
    // the dashboard KPI cards stay accurate even while the table is paginated.
    const stats = { total, segmentCounts: { 'high-value': 0, returning: 0, new: 0 } };
    for (const c of allCustomers) {
      const seg = getSegment(c.orderCount, c.totalSpend);
      stats.segmentCounts[seg] = (stats.segmentCounts[seg] || 0) + 1;
    }

    if (total === 0) {
      return res.json({
        success: true,
        data: [],
        meta: { page: 1, limit, total: 0, totalPages: 0 },
        stats,
      });
    }

    // `?all=true` preserves the original full-list behaviour for any caller that
    // still needs every customer at once; otherwise enrich just the page slice.
    const start = (page - 1) * limit;
    const pageSlice = all ? allCustomers : allCustomers.slice(start, start + limit);

    // Resolve Firebase user info + UserProfile for the slice only, in parallel.
    const uniqueUids = [...new Set(pageSlice.map(c => c.userId).filter(Boolean))];
    const userMap = {};
    const profileMap = {};

    await Promise.all(
      uniqueUids.map(async uid => {
        try {
          userMap[uid] = await resolveFirebaseUser(uid);
          profileMap[uid] = await UserProfile.findOne({ userId: uid });
        } catch (err) {
          console.error(`Error resolving user ${uid}:`, err.message);
          userMap[uid] = { displayName: '—', email: '—', photoURL: null };
          profileMap[uid] = null;
        }
      })
    );

    const data = pageSlice.map(c => {
      const inactivityInfo = calculateInactivityInfo(c.lastOrder);
      return {
        ...c,
        segment: getSegment(c.orderCount, c.totalSpend),
        customerName: userMap[c.userId]?.displayName ?? '—',
        customerEmail: userMap[c.userId]?.email ?? '—',
        customerPhoto: userMap[c.userId]?.photoURL ?? null,
        daysSinceLastOrder: inactivityInfo.daysSinceLastOrder,
        eligibleForReminder: inactivityInfo.eligibleForReminder,
        lastReminderEmailSentAt: profileMap[c.userId]?.lastReminderEmailSentAt ?? null,
      };
    });

    res.json({
      success: true,
      data,
      meta: {
        page: all ? 1 : page,
        limit: all ? total : limit,
        total,
        totalPages: all ? 1 : Math.ceil(total / limit),
      },
      stats,
    });
  } catch (err) {
    console.error('[API] GET /customers error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers/:userId
// Single customer stats + order history, enriched with Firebase user info
// Admin-only access to protect customer PII
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:userId', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId, status: 'paid' })
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const orderCount = orders.length;
    const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
    const firstOrder = orders[orders.length - 1].createdAt;
    const lastOrder = orders[0].createdAt;
    const segment = getSegment(orderCount, totalSpend);

    // Get inactivity info
    const inactivityInfo = calculateInactivityInfo(lastOrder);

    // Get profile info with error handling
    let profile = null;
    try {
      profile = await UserProfile.findOne({ userId });
    } catch (err) {
      console.error(`Error fetching profile for user ${userId}:`, err.message);
    }

    // Resolve Firebase user info for this single UID with error handling
    let firebaseUser = await resolveFirebaseUser(userId);

    res.json({
      success: true,
      data: {
        userId,
        customerName: firebaseUser?.displayName ?? '—',
        customerEmail: firebaseUser?.email ?? '—',
        customerPhoto: firebaseUser?.photoURL ?? null,
        orderCount,
        totalSpend,
        firstOrder,
        lastOrder,
        segment,
        daysSinceLastOrder: inactivityInfo.daysSinceLastOrder,
        eligibleForReminder: inactivityInfo.eligibleForReminder,
        lastReminderEmailSentAt: profile?.lastReminderEmailSentAt ?? null,
        orders,
      },
    });
  } catch (err) {
    console.error('Customer detail error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customers/:userId/send-reminder
// Send inactivity reminder email to a customer
// Admin-only endpoint: requires Firebase auth token from admin user
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:userId/send-reminder', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Send the reminder email
    const result = await sendInactivityReminderEmail(userId);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: result.message });
  } catch (err) {
    console.error('send-reminder error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;