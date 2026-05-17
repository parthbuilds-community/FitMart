// server/services/orderService.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Creates an order from explicit items or the user's cart.
 * Snapshots product prices, checks stock, creates the order,
 * deducts stock, and clears the cart inside a MongoDB transaction.
 *
 * @param {string} userId - The Firebase UID of the user
 * @param {Array} [items] - Optional array of { productId, quantity }. If omitted, uses the cart.
 * @returns {Promise<Object>} The created order document
 */
async function createOrder(userId, items = null) {
  let orderItems = items;

  if (!orderItems || !orderItems.length) {
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      throw new Error('Cart is empty');
    }
    orderItems = cart.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));
  }

  const populated = [];
  let total = 0;

  for (const it of orderItems) {
    const p = await Product.findOne({ productId: Number(it.productId) });
    if (!p) {
      throw new Error(`Product ${it.productId} not found`);
    }

    if (p.stock !== null) {
      const available = p.stock - (p.reserved || 0);
      if (available < it.quantity) {
        throw new Error(`Insufficient stock for ${p.name}. Available: ${available}`);
      }
    }

    populated.push({ productId: p.productId, quantity: it.quantity, price: p.price });
    total += p.price * it.quantity;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [order] = await Order.create(
      [{ userId, items: populated, total }],
      { session }
    );

    for (const it of orderItems) {
      const p = await Product.findOne({ productId: Number(it.productId) }).session(
        session
      );
      if (p && p.stock !== null) {
        const currentReserved = Number(p.reserved || 0);
        const newReserved = Math.max(0, currentReserved - it.quantity);

        await Product.findOneAndUpdate(
          { productId: p.productId },
          {
            $inc: { stock: -it.quantity },
            $set: { reserved: newReserved },
          },
          { session }
        );
      }
    }

    await Cart.findOneAndUpdate({ userId }, { items: [] }, { session });

    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = { createOrder };
