// server/services/orderService.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Creates an order from explicit items or the user's cart.
 * Snapshots product prices, checks stock, creates the order,
 * deducts stock, and clears the cart.
 *
 * @param {string} userId - The Firebase UID of the user
 * @param {Array} [items] - Optional array of { productId, quantity }. If omitted, uses the cart.
 * @returns {Promise<Object>} The created order document
 */
async function createOrder(userId, items = null) {
  let orderItems = items;
  let fromCart = false;

  // If no items are explicitly provided, fetch them from the user's cart
  if (!orderItems || !orderItems.length) {
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      throw new Error('Cart is empty');
    }
    fromCart = true;
    orderItems = cart.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
  }

  // Build order items with price snapshot. Integer paise is authoritative;
  // the rupee fields remain for the not-yet-ported client.
  const populated = [];
  let total = 0;
  let totalMinor = 0;

  for (const it of orderItems) {
    const p = await Product.findOne({ productId: Number(it.productId) });
    if (!p) {
      throw new Error(`Product ${it.productId} not found`);
    }

    // Oversell guard - skip check if stock is null (unlimited)
    if (p.stock !== null) {
      // Cart quantities are already counted in p.reserved, so add them back
      // before checking availability. Otherwise a cart that has reserved the
      // last unit would fail its own checkout.
      const available = p.stock - (p.reserved || 0) + (fromCart ? it.quantity : 0);
      if (available < it.quantity) {
        throw new Error(`Insufficient stock for ${p.name}. Available: ${available}`);
      }
    }

    const priceMinor = Number.isInteger(p.priceMinor) && p.priceMinor >= 0
      ? p.priceMinor
      : Math.round(Number(p.price) * 100);
    const lineTotalMinor = priceMinor * it.quantity;

    populated.push({
      productId: p.productId,
      quantity: it.quantity,
      price: p.price,
      priceMinor,
      lineTotalMinor,
    });
    total += p.price * it.quantity;
    totalMinor += lineTotalMinor;
  }

  // Create the order document
  const order = await Order.create({
    userId,
    items: populated,
    total,
    subtotalMinor: totalMinor,
    shippingMinor: 0,
    totalMinor,
    currency: 'INR',
  });

  // Deduct stock and release the cart's reserved amounts for each item.
  // Explicit items (not from the cart) were never reserved, so only their
  // stock is decremented.
  for (const it of orderItems) {
    const p = await Product.findOne({ productId: Number(it.productId) });
    if (!p) continue;

    const update = {};
    if (p.stock !== null) update.$inc = { stock: -it.quantity };
    if (fromCart) {
      // Safely calculate new reserved to avoid negative values
      update.$set = {
        reserved: Math.max(0, Number(p.reserved || 0) - it.quantity),
      };
    }

    if (Object.keys(update).length) {
      await Product.findOneAndUpdate({ productId: p.productId }, update);
    }
  }

  // Clear the user's cart (purchasing finalizes reservation)
  await Cart.findOneAndUpdate({ userId }, { items: [] });

  return order;
}

module.exports = { createOrder };
