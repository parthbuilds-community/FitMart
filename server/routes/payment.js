// server/routes/payment.js
const Rewards = require("../models/Rewards");
const rewardsConfig = require("../config/rewardsConfig");
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const { enqueueEmailJob } = require("../services/emailQueue");
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
router.post("/create-order", verifyFirebaseToken, async (req, res) => {
  try {
    const { amount, currency = "INR", userId } = req.body;
    if (!amount || !userId)
      return res.status(400).json({ error: "amount and userId are required" });

    // receipt must be ≤ 40 chars
    const shortId = userId.slice(-8);
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
router.post("/verify-payment", verifyFirebaseToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ error: "Missing required payment fields" });

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ error: "Signature mismatch — payment not verified" });

    //  STEP 1: Prevent duplicate orders
    const Order = require("../models/Order");
    const existingOrder = await Order.findOne({ paymentId: razorpay_payment_id });

    if (existingOrder) {
      return res.json({ success: true, message: "Order already created" });
    }

    // STEP 2: Create order using service logic
    let order;
    try {
      order = await createOrder(userId);
    } catch (createErr) {
      return res.status(400).json({ error: createErr.message });
    }

    //  STEP 3: Attach paymentId to order
    await Order.findByIdAndUpdate(order._id, {
      paymentId: razorpay_payment_id,
      status: "paid"
    });

    // Update local object to reflect changes
    order.paymentId = razorpay_payment_id;
    order.status = "paid";
        // STEP 4: Award FitRewards points after successful payment
    try {
      let rewards = await Rewards.findOne({ userId });

      if (!rewards) {
        rewards = await Rewards.create({
          userId,
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

    // STEP 5: Enqueue first-purchase email via BullMQ (non-blocking)
    // Enqueue failure must not break the already-successful payment
    enqueueEmailJob("firstPurchaseEmail", { userId, orderData: order }).catch((err) => {
      console.error("Failed to enqueue first-purchase email job:", err.message);
      // Don't throw — queue failure should not break payment success
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
router.post("/clear-cart", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    await releaseAndClearCart(userId);
    res.json({ success: true });
  } catch (err) {
    console.error("clear-cart error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /demo-success   ← controlled by DEMO_PAYMENT env var
// Body: { userId }
// Skips Razorpay entirely, fakes a payment ID, creates a real order using
// existing order-creation logic, awards FitRewards, queues email via BullMQ,
// and returns success.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /demo-success
 * @desc    Simulates a successful Razorpay payment — creates a real order,
 *          awards FitRewards points, and queues a confirmation email.
 *          Enabled only when DEMO_PAYMENT=true.
 * @access  Private (Firebase auth required)
 */
router.post("/demo-success", verifyFirebaseToken, async (req, res) => {
  // Gate: only enabled when DEMO_PAYMENT=true (works regardless of NODE_ENV)
  if (process.env.DEMO_PAYMENT !== "true") {
    return res.status(404).json({ error: "Not found" });
  }

  console.log("[DEMO PAYMENT] Request received");

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    // Generate a fake payment ID that looks like a real Razorpay one
    const fakePaymentId = `pay_DEMO_${Date.now()}`;

    // STEP 1: Create order from user's cart using the shared service
    console.log("[DEMO PAYMENT] Creating order");
    const Order = require("../models/Order");
    let order;
    try {
      order = await createOrder(userId);
    } catch (createErr) {
      if (createErr.message === "Cart is empty") {
        // Still clear any empty cart just in case
        await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } }, { returnDocument: 'after' });
      }
      return res.status(400).json({ error: createErr.message });
    }

    // STEP 2: Attach demo paymentId to order
    await Order.findByIdAndUpdate(order._id, {
      paymentId: fakePaymentId,
      status: "paid"
    });

    order.paymentId = fakePaymentId;
    order.status = "paid";
    console.log(`[DEMO PAYMENT] Order created: ${order._id}`);

    // STEP 3: Award FitRewards points (same logic as verify-payment)
    try {
      let rewards = await Rewards.findOne({ userId });

      if (!rewards) {
        rewards = await Rewards.create({
          userId,
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
          description: "Points earned from demo purchase",
          createdAt: new Date(),
        });

        rewards.pointsBalance += points;
        await rewards.save();
        console.log(`[DEMO PAYMENT] Awarded ${points} FitRewards points`);
      }
    } catch (rewardError) {
      console.error("[DEMO PAYMENT] Reward earning failed:", rewardError.message);
    }

    // STEP 4: Enqueue first-purchase email via BullMQ (non-blocking)
    let emailQueued = false;
    try {
      const emailJob = await enqueueEmailJob("firstPurchaseEmail", { userId, orderData: order });
      emailQueued = true;
      console.log(`[DEMO PAYMENT] Email job queued: ${emailJob.id}`);
    } catch (err) {
      console.error("[DEMO PAYMENT] Failed to enqueue email job:", err.message);
      // Don't throw — queue failure should not break payment success
    }

    res.json({ success: true, paymentId: fakePaymentId, order, emailQueued });
  } catch (err) {
    console.error("[DEMO PAYMENT] Error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;