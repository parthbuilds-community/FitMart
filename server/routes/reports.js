const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const verifyAdmin = require('../middleware/verifyAdmin');

/**
 * @route   GET /api/reports/sales
 * @desc    Returns sales report for a given time range (query: range=daily|weekly|monthly);
 *          includes a summary of total revenue, order count and average order value,
 *          revenue breakdown by date, and product performance ranked by revenue
 * @access  Public
 */
router.get('/sales', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const { range = 'weekly' } = req.query;

    // Step 1: Calculate the start date based on range
    const now = new Date();
    const startDate = new Date();

    if (range === 'daily') {
      startDate.setDate(now.getDate() - 1);       // last 24 hours
    } else if (range === 'monthly') {
      startDate.setDate(now.getDate() - 30);      // last 30 days
    } else {
      startDate.setDate(now.getDate() - 7);       // last 7 days (default: weekly)
    }

    // Step 2: Revenue by date aggregation pipeline
    const revenueByDate = await Order.aggregate([
      {
        // Stage 1: only paid orders within the date range
        $match: {
          status: 'paid',
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      {
        // Stage 2: group by date (year-month-day), sum total and count orders
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      {
        // Stage 3: sort by date ascending
        $sort: { _id: 1 },
      },
      {
        // Stage 4: rename _id to date for cleaner response
        $project: {
          _id: 0,
          date: '$_id',
          totalRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    // Step 3: Product performance aggregation pipeline
    const productPerformance = await Order.aggregate([
      {
        // Stage 1: only paid orders within the date range
        $match: {
          status: 'paid',
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      {
        // Stage 2: unwind items array — one document per item
        // e.g. an order with 3 items becomes 3 separate documents
        $unwind: '$items',
      },
      {
        // Stage 3: group by productId, sum quantity sold and revenue
        $group: {
          _id: '$items.productId',
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      {
        // Stage 4: sort by revenue descending (highest first)
        $sort: { totalRevenue: -1 },
      },
      {
        // Stage 5: rename _id to productId for cleaner response
        $project: {
          _id: 0,
          productId: '$_id',
          totalQuantitySold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // Step 4: Calculate summary totals
    const totalRevenue = revenueByDate.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalOrders = revenueByDate.reduce((sum, d) => sum + d.orderCount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      range,
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue),
      },
      revenueByDate,
      productPerformance,
    });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;