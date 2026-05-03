// server/routes/customers.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const UserProfile = require('../models/UserProfile');
const admin = require('../firebaseAdmin');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const { sendInactivityReminderEmail } = require('../services/inactiveCustomerEmailService');

// ── Helper: resolve Firebase UID → { displayName, email, photoURL } ───────
async function resolveFirebaseUser(uid) {
  try {
    const u = await admin.auth().getUser(uid);
    return {
      displayName: u.displayName || '—',
      email: u.email || '—',
      photoURL: u.photoURL || null,
    };
  } catch {
    return { displayName: '—', email: '—', photoURL: null };
  }
}

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
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    console.log('[API] GET /customers request received');
    
    const customers = await Order.aggregate([
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

    console.log(`[API] Found ${customers.length || 0} customers from orders`);

    if (!customers || customers.length === 0) {
      console.log('[API] No customers found, returning empty list');
      return res.json({ success: true, data: [] });
    }

    // Deduplicate UIDs and resolve Firebase user info + UserProfile in parallel
    const uniqueUids = [...new Set(customers.map(c => c.userId).filter(Boolean))];
    console.log(`[API] Resolving ${uniqueUids.length} unique Firebase users...`);
    
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

    console.log('[API] Firebase resolution complete');

    const result = customers.map(c => {
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

    console.log(`[API] Returning ${result.length} enriched customers`);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[API] GET /customers error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers/:userId
// Single customer stats + order history, enriched with Firebase user info
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:userId', async (req, res) => {
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
router.post('/:userId/send-reminder', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUid = process.env.VITE_ADMIN_UID || 'n5LtrXIGVSVjNktRn1PgDXZbHgq1';

    // Check if requester is admin
    if (req.user.uid !== adminUid) {
      return res.status(403).json({ success: false, error: 'Forbidden — admin access required' });
    }

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