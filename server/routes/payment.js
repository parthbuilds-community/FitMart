// server/routes/payment.js
const Rewards = require("../models/Rewards");
const rewardsConfig = require("../config/rewardsConfig");
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const router = express.Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/requireAuth");
const { sendFirstPurchaseEmail } = require("../services/firstPurchaseEmailService");
const { createOrder } = require("../services/orderService");

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// ── Shared helper: release reserved stock for all cart items ───────────────
// Mirrors the logic in server/routes/cart.js  DELETE /:userId
async function releaseAndClearCart(userId) {
  const cart = await Cart.findOne({ userId });
  if (!cart || !cart.items.length) return;

  for (const item of cart.items) {
    const prod = await Product.findOne({ productId: Number(item.productId) });
    if (prod) {
      prod.reserved = Math.max(0, (prod.reserved || 0) - item.quantity);
      await prod.save();
    }
  }

  cart.items = [];
  await cart.save();
}

/**
 * @route   POST /create-order
 * @desc    Creates a Razorpay payment order; body: { amount (₹), currency, userId }
 * @access  Private
 */
router.post("/create-order", requireAuth, async (req, res) => {
  try {
    const { amount, currency = "INR", userId } = req.body;
    if (!amount || typeof userId !== "string" || !userId.trim())
      return res.status(400).json({ error: "amount and userId are required" });
    const safeUserId = userId.trim();
    if (req.user.uid !== safeUserId) {
      return res.status(403).json({ error: "Forbidden — userId must match the authenticated user" });
    }
    if (currency !== "INR" || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount or currency" });
    }

    // receipt must be ≤ 40 chars
    const shortId = safeUserId.slice(-8);
    const shortTs = String(Date.now()).slice(-8);
    const receipt = `r_${shortId}_${shortTs}`;   // always 18 chars

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),   // ₹ → paise
      currency,
      receipt,
    });

    res.json(order);
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /verify-payment
 * @desc    Verifies Razorpay HMAC signature, prevents duplicate orders, creates the
 *          order record, and attaches the paymentId with status "paid";
 *          body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId }
 * @access  Private
 */
router.post("/verify-payment", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature ||
        typeof razorpay_order_id !== "string" ||
        typeof razorpay_payment_id !== "string" ||
        typeof razorpay_signature !== "string" ||
        typeof userId !== "string" || !userId.trim())
      return res.status(400).json({ error: "Missing required payment fields" });
    const safeUserId = userId.trim();
    const safePaymentId = razorpay_payment_id.trim();
    const safeOrderId = razorpay_order_id.trim();
    if (!safePaymentId || !safeOrderId) {
      return res.status(400).json({ error: "Missing required payment fields" });
    }
    if (req.user.uid !== safeUserId) {
      return res.status(403).json({ error: "Forbidden — userId must match the authenticated user" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${safeOrderId}|${safePaymentId}`)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ error: "Signature mismatch — payment not verified" });

    //  STEP 1: Prevent duplicate orders
    const Order = require("../models/Order");
    const existingOrder = await Order.findOne({ paymentId: safePaymentId });

    if (existingOrder) {
      return res.json({ success: true, message: "Order already created" });
    }

    // STEP 2: Create order using service logic
    let order;
    try {
      order = await createOrder(safeUserId);
    } catch (createErr) {
      return res.status(400).json({ error: createErr.message });
    }

    //  STEP 3: Attach paymentId to order
    if (!mongoose.isValidObjectId(order._id)) {
      return res.status(500).json({ error: "Invalid created order ID" });
    }
    await Order.findByIdAndUpdate(
      new mongoose.Types.ObjectId(order._id),
      { $set: { paymentId: safePaymentId, status: "paid" } }
    );

    // Update local object to reflect changes
    order.paymentId = safePaymentId;
    order.status = "paid";
        // STEP 4: Award FitRewards points after successful payment
    try {
      let rewards = await Rewards.findOne({ userId: safeUserId });

      if (!rewards) {
        rewards = await Rewards.create({
          userId: safeUserId,
          pointsBalance: 0,
          transactions: [],
        });
      }

      const alreadyCredited = rewards.transactions.some(
        (transaction) => transaction.orderId === String(order._id)
      );

      if (!alreadyCredited) {
        const purchaseAmount =
          order.totalAmount || order.total || order.amount || 0;

        let points = Math.floor(
          Number(purchaseAmount) * rewardsConfig.POINTS_PER_RUPEE
        );

        if (rewards.transactions.length === 0) {
          points += rewardsConfig.FIRST_PURCHASE_BONUS;
        }

        rewards.transactions.push({
          type: "earned",
          points,
          source: "purchase",
          orderId: String(order._id),
          description: "Points earned from purchase",
          createdAt: new Date(),
        });

        rewards.pointsBalance += points;
        await rewards.save();
      }
    } catch (rewardError) {
      console.error("Reward earning failed:", rewardError.message);
    }

    // STEP 4: Send first-purchase email (non-blocking)
    // Email sending should not fail the payment flow
    sendFirstPurchaseEmail(safeUserId, order).catch((err) => {
      console.error("First-purchase email service error:", err.message);
      // Don't throw — email failure should not break payment success
    });

    res.json({ success: true, order });

  } catch (err) {
    console.error("verify-payment error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /clear-cart
 * @desc    Releases all reserved stock and clears the user's cart without creating an order;
 *          body: { userId }
 * @access  Private
 */
router.post("/clear-cart", requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    if (typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({ error: "userId is required" });
    }
    const safeUserId = userId.trim();
    if (req.user.uid !== safeUserId) {
      return res.status(403).json({ error: "Forbidden — userId must match the authenticated user" });
    }

    await releaseAndClearCart(safeUserId);
    res.json({ success: true });
  } catch (err) {
    console.error("clear-cart error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
