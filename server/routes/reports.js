const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const verifyAdmin = require('../middleware/verifyAdmin');

const RANGE_DAYS = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

/**
 * @route   GET /api/reports/sales
 * @desc    Returns sales report for a given time range (query: range=daily|weekly|monthly)
 * @access  Admin
 */
router.get('/sales', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const requestedRange = req.query.range || 'weekly';
    const range = RANGE_DAYS[requestedRange] ? requestedRange : 'weekly';

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - RANGE_DAYS[range]);

    const paidOrdersInRange = {
      status: 'paid',
      createdAt: { $gte: startDate, $lte: now },
    };

    const revenueByDate = await Order.aggregate([
      { $match: paidOrdersInRange },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    const productPerformance = await Order.aggregate([
      { $match: paidOrdersInRange },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: 'productId',
          as: 'productInfo',
        },
      },
      {
        $addFields: {
          itemPrice: {
            $ifNull: ['$items.price', { $arrayElemAt: ['$productInfo.price', 0] }],
          },
        },
      },
      {
        $group: {
          _id: '$items.productId',
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: {
              $multiply: [{ $ifNull: ['$itemPrice', 0] }, '$items.quantity'],
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          totalQuantitySold: 1,
          totalRevenue: 1,
        },
      },
    ]);

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
