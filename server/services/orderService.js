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

  // If no items are explicitly provided, fetch them from the user's cart
  if (!orderItems || !orderItems.length) {
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      throw new Error('Cart is empty');
    }
    orderItems = cart.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
  }

  // Build order items with price snapshot
  const populated = [];
  let total = 0;

  for (const it of orderItems) {
    const p = await Product.findOne({ productId: Number(it.productId) });
    if (!p) {
      throw new Error(`Product ${it.productId} not found`);
    }

    // Oversell guard - skip check if stock is null (unlimited)
    if (p.stock !== null) {
      const available = p.stock - (p.reserved || 0);
      if (available < it.quantity) {
        throw new Error(`Insufficient stock for ${p.name}. Available: ${available}`);
      }
    }

    populated.push({ productId: p.productId, quantity: it.quantity, price: p.price });
    total += p.price * it.quantity;
  }

  // Create the order document
  const order = await Order.create({ userId, items: populated, total });

  // Deduct stock and reserved amounts for each item
  for (const it of orderItems) {
    const p = await Product.findOne({ productId: Number(it.productId) });
    if (p && p.stock !== null) {
      // Safely calculate new reserved to avoid negative values
      const currentReserved = Number(p.reserved || 0);
      const newReserved = Math.max(0, currentReserved - it.quantity);
      
      await Product.findOneAndUpdate(
        { productId: p.productId },
        { 
          $inc: { stock: -it.quantity },
          $set: { reserved: newReserved }
        }
      );
    }
  }

  // Clear the user's cart (purchasing finalizes reservation)
  await Cart.findOneAndUpdate({ userId }, { items: [] });

  return order;
}

module.exports = { createOrder };
