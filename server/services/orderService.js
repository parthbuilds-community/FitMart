// server/services/orderService.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateCheckout } = require('./checkoutService');

/**
 * Fulfills a pending order using the immutable snapshot.
 * - Validates stock for all items before any mutation.
 * - Atomically deducts physical stock with rollback compensation if an error occurs.
 * - Does NOT blindly clear the user's cart: preserves unrelated items added after /create-order.
 * - Reconciles cart items and adjusts Product.reserved only for quantities actually still held.
 * - Guarantees reserved never drops below zero.
 * - Leaves persisted Order.total unchanged from the Razorpay order binding.
 *
 * @param {Object} order - The pending Order document
 * @param {string} paymentId - The verified Razorpay payment ID
 * @returns {Promise<Object>} The fulfilled order document
 */
async function fulfillOrder(order, paymentId) {
  // Phase 1: Pre-validation — ensure all products exist and have sufficient physical stock
  for (const it of order.items) {
    const p = await Product.findOne({ productId: Number(it.productId) });
    if (!p) {
      throw new Error(`Product ${it.productId} not found at fulfillment`);
    }
    if (p.stock !== null && p.stock < it.quantity) {
      throw new Error(
        `Insufficient stock for ${p.name} at fulfillment. Required: ${it.quantity}, Available: ${p.stock}`
      );
    }
  }

  // Phase 2: Deduct physical stock with compensating rollback to prevent partial mutation
  const deductedStock = [];
  try {
    for (const it of order.items) {
      const p = await Product.findOne({ productId: Number(it.productId) });
      if (p && p.stock !== null) {
        const updated = await Product.findOneAndUpdate(
          { productId: p.productId, stock: { $gte: it.quantity } },
          { $inc: { stock: -it.quantity } },
          { returnDocument: 'after' }
        );
        if (!updated) {
          throw new Error(`Insufficient stock for ${p.name} during deduction`);
        }
        deductedStock.push({ productId: p.productId, quantity: it.quantity });
      }
    }
  } catch (deductErr) {
    // Roll back any physical stock deducted so far
    for (const item of deductedStock) {
      await Product.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { stock: item.quantity } }
      );
    }
    throw deductErr;
  }

  // Phase 3: Reconcile current cart & adjust reservations
  // Do NOT blindly clear the user's cart; preserve items added after /create-order
  const cart = await Cart.findOne({ userId: order.userId });
  if (cart && cart.items && cart.items.length) {
    for (const it of order.items) {
      const idx = cart.items.findIndex(
        (i) => Number(i.productId) === Number(it.productId)
      );

      if (idx !== -1) {
        const cartItem = cart.items[idx];
        // Only remove the quantity fulfilled by this order (up to what's in cart)
        const qtyToRemove = Math.min(cartItem.quantity, it.quantity);
        cartItem.quantity -= qtyToRemove;

        if (cartItem.quantity <= 0) {
          cart.items.splice(idx, 1);
        }

        // Adjust Product.reserved by only the quantity that was actually held in cart
        if (qtyToRemove > 0) {
          const prod = await Product.findOne({ productId: Number(it.productId) });
          if (prod) {
            const currentReserved = Number(prod.reserved || 0);
            const newReserved = Math.max(0, currentReserved - qtyToRemove);
            await Product.findOneAndUpdate(
              { productId: prod.productId },
              { $set: { reserved: newReserved } }
            );
          }
        }
      }
      // If idx === -1, the item was already removed from the cart by the user before payment,
      // and routes/cart.js already decremented Product.reserved at removal time.
    }

    await cart.save();
  }

  // Phase 4: Mark order paid (Order.total remains unchanged)
  order.paymentId = paymentId;
  order.status = 'paid';
  await order.save();

  return order;
}

/**
 * Creates an order from explicit items or the user's cart.
 * Snapshots product prices, checks stock, creates the order,
 * deducts stock, and reconciles the cart.
 * Reuses calculateCheckout(userId) to ensure persisted Order total
 * matches the discounted checkout total when created from cart.
 *
 * @param {string} userId - The Firebase UID of the user
 * @param {Array} [items] - Optional array of { productId, quantity }. If omitted, uses the cart.
 * @returns {Promise<Object>} The created order document
 */
async function createOrder(userId, items = null) {
  let orderItems = items;
  let orderTotal = null;

  // If no items are explicitly provided, fetch them from the user's cart and calculate discounted total
  if (!orderItems || !orderItems.length) {
    const checkout = await calculateCheckout(userId);
    orderTotal = checkout.total;

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      throw new Error('Cart is empty');
    }
    orderItems = cart.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
  }

  // Build order items with price snapshot
  const populated = [];
  let calculatedSubtotal = 0;

  for (const it of orderItems) {
    const p = await Product.findOne({ productId: Number(it.productId) });
    if (!p) {
      throw new Error(`Product ${it.productId} not found`);
    }

    // Oversell guard: if stock is finite, check stock availability
    if (p.stock !== null) {
      // If items came from cart, the item's quantity is already in p.reserved.
      // Only for non-cart explicit items do we subtract all reserved.
      const isCartOrder = orderTotal !== null;
      const effectiveReserved = isCartOrder
        ? Math.max(0, (p.reserved || 0) - it.quantity)
        : (p.reserved || 0);
      const available = p.stock - effectiveReserved;
      if (available < it.quantity) {
        throw new Error(`Insufficient stock for ${p.name}. Available: ${available}`);
      }
    }

    populated.push({ productId: p.productId, quantity: it.quantity, price: p.price });
    calculatedSubtotal += p.price * it.quantity;
  }

  const total = orderTotal !== null ? orderTotal : calculatedSubtotal;

  // Create the order document
  const order = await Order.create({ userId, items: populated, total, status: 'created' });

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

  // Clear or reconcile the user's cart (purchasing finalizes reservation)
  const userCart = await Cart.findOne({ userId });
  if (userCart && userCart.items) {
    for (const it of orderItems) {
      const idx = userCart.items.findIndex(i => Number(i.productId) === Number(it.productId));
      if (idx !== -1) {
        const qtyToRemove = Math.min(userCart.items[idx].quantity, it.quantity);
        userCart.items[idx].quantity -= qtyToRemove;
        if (userCart.items[idx].quantity <= 0) {
          userCart.items.splice(idx, 1);
        }
      }
    }
    await userCart.save();
  }

  return order;
}

module.exports = { createOrder, fulfillOrder };
