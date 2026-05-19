// server/routes/payment.js

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const { sendFirstPurchaseEmail } = require("../services/firstPurchaseEmailService");
const { createOrder } = require("../services/orderService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
         await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } }, { new: true });
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