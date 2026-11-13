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
      notes: { userId },                  // passed through to webhook events
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

    // STEP 4: Send first-purchase email (non-blocking)
    // Email sending should not fail the payment flow
    sendFirstPurchaseEmail(userId, order).catch((err) => {
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

/**
 * @route   POST /webhook
 * @desc    Razorpay webhook handler — verifies x-razorpay-signature header using the
 *          raw request body, handles payment.captured / order.paid events idempotently.
 *          If the client callback (verify-payment) never arrived, this ensures the order
 *          is still created and recorded. req.body is a Buffer delivered by the
 *          express.raw() middleware registered in server/index.js.
 * @access  Public (authenticated by Razorpay HMAC signature)
 */
router.post('/webhook', async (req, res) => {
  try {
    const rawBody = req.body;                       // Buffer from express.raw()
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('RAZORPAY_WEBHOOK_SECRET is not configured — cannot verify webhooks');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify HMAC-SHA256 signature against the raw body
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(expectedSignature);
    const reqBuf = Buffer.from(signature);

    if (sigBuf.length !== reqBuf.length || !crypto.timingSafeEqual(sigBuf, reqBuf)) {
      logger.warn('Webhook signature mismatch — possible forgery attempt');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Parse the verified event payload
    const event = JSON.parse(rawBody.toString());
    const eventType = event.event;

    logger.info(`Webhook received: ${eventType}`);

    // ── Extract payment details based on event type ──────────────────────────
    let paymentId = null;
    let userId = null;

    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity;
      paymentId = payment.id;
      userId = payment.notes?.userId;
    } else {
      // Acknowledge non-payment events (including order.paid) silently so Razorpay
      // doesn't retry. We only create orders on payment.captured because it always
      // carries paymentId + notes.userId, avoiding the race where order.paid fires
      // first without a paymentId.
      return res.status(200).json({ status: 'ignored' });
    }

    if (!userId) {
      logger.warn(`Webhook ${eventType}: no userId in notes — order cannot be processed`);
      return res.status(200).json({ status: 'ignored', reason: 'no userId in notes' });
    }

    // ── Idempotency check — prevent duplicate order creation ─────────────────
    // If the client callback (verify-payment) already created the order with this
    // paymentId, or a previous webhook delivery did, skip processing.
    const Order = require('../models/Order');

    if (paymentId) {
      const existingOrder = await Order.findOne({ paymentId });
      if (existingOrder) {
        logger.info(`Webhook: order ${existingOrder._id} already exists for payment ${paymentId}`);
        return res.status(200).json({ status: 'already_exists', orderId: existingOrder._id });
      }
    }

    // ── Create the order from the user's cart ────────────────────────────────
    let order;
    try {
      order = await createOrder(userId);
    } catch (createErr) {
      // Cart empty likely means verify-payment already ran and cleared it,
      // or the user's session expired. Return 200 to avoid Razorpay retries.
      logger.warn(`Webhook: createOrder failed for ${userId}: ${createErr.message}`);
      return res.status(200).json({ status: 'skipped', reason: createErr.message });
    }

    // Attach paymentId and mark the order as paid
    const updateFields = { status: 'paid' };
    if (paymentId) {
      updateFields.paymentId = paymentId;
    }
    await Order.findByIdAndUpdate(order._id, updateFields);
    Object.assign(order, updateFields);

    // ── Award FitRewards loyalty points ───────────────────────────────────────
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
        (t) => t.orderId === String(order._id),
      );

      if (!alreadyCredited) {
        const purchaseAmount = order.totalAmount || order.total || order.amount || 0;
        let points = Math.floor(Number(purchaseAmount) * rewardsConfig.POINTS_PER_RUPEE);

        if (rewards.transactions.length === 0) {
          points += rewardsConfig.FIRST_PURCHASE_BONUS;
        }

        rewards.transactions.push({
          type: 'earned',
          points,
          source: 'purchase',
          orderId: String(order._id),
          description: 'Points earned from purchase',
          createdAt: new Date(),
        });

        rewards.pointsBalance += points;
        await rewards.save();
      }
    } catch (rewardError) {
      logger.error('Webhook reward earning failed:', rewardError.message);
    }

    // ── Send first-purchase email (non-blocking) ─────────────────────────────
    sendFirstPurchaseEmail(userId, order).catch((err) => {
      logger.error('Webhook first-purchase email error:', err.message);
    });

    res.status(200).json({ status: 'ok', orderId: order._id });
  } catch (err) {
    logger.error('Webhook error:', err);
    // Return 200 even on unexpected errors to prevent Razorpay from retrying
    // for internal processing failures that will not succeed on retry.
    res.status(200).json({ status: 'error', reason: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /demo-success   ← DEV / TEST ONLY — disabled in production
// Body: { userId }
// Skips Razorpay entirely, fakes a payment ID, clears cart, returns success.
// NOTE: This route does NOT require Firebase authentication for testing purposes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /demo-success
 * @desc    Simulates a successful payment for testing only — skips Razorpay, clears cart,
 *          and returns success without creating an order
 * @access  Public (TESTING ONLY) - No authentication required
 */
router.post("/demo-success", async (req, res) => {
  // TEST-ONLY bypass — never register behavior in production. Returns 404 so the
  // endpoint is inert outside of non-production environments (same gate as /api/dev).
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    // Generate a fake payment ID that looks like a real Razorpay one
    const fakePaymentId = `pay_DEMO_${Date.now()}`;
    
    // Create an order from the user's cart using the shared service
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

    // Attach paymentId to order
    await Order.findByIdAndUpdate(order._id, {
      paymentId: fakePaymentId,
      status: "paid"
    });
    
    order.paymentId = fakePaymentId;
    order.status = "paid";

    // Send first-purchase email (non-blocking)
    // Email sending should not fail the payment flow
    sendFirstPurchaseEmail(userId, order).catch((err) => {
      console.error("First-purchase email service error:", err.message);
      // Don't throw — email failure should not break payment success
    });

    res.json({ success: true, paymentId: fakePaymentId, order });
  } catch (err) {
    console.error("demo-success error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;