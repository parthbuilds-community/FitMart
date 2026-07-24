// server/services/cartService.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Atomically adjusts Product.reserved by `delta` using a single findOneAndUpdate.
 *
 * Invariants enforced at the DB level:
 *   - reserved + delta >= 0  (reserved never goes negative)
 *   - reserved + delta <= stock  (never exceeds finite stock)
 *
 * Throws if the product is not found or if either invariant would be violated.
 *
 * @param {number}          productId - The product's numeric productId field
 * @param {number}          delta     - Amount to add (positive) or subtract (negative)
 * @param {ClientSession|null} [session=null] - Optional Mongoose session for transaction support
 * @returns {Promise<Product>} The updated product document
 */
async function adjustReserved(productId, delta, session = null) {
  // Always enforce: reserved + delta must be >= 0
  const filter = {
    productId: Number(productId),
    $expr: {
      $gte: [
        { $add: [{ $ifNull: ['$reserved', 0] }, delta] },
        0,
      ],
    },
  };

  // When adding to reserved, also enforce: reserved + delta must be <= stock
  // Skip this cap for unlimited products (stock === null)
  if (delta > 0) {
    filter.$or = [
      { stock: null },
      {
        $expr: {
          $lte: [
            { $add: [{ $ifNull: ['$reserved', 0] }, delta] },
            '$stock',
          ],
        },
      },
    ];
  }

  const updated = await Product.findOneAndUpdate(
    filter,
    { $inc: { reserved: delta } },
    {
      returnDocument: 'after',
      ...(session ? { session } : {}),
    }
  );

  if (!updated) {
    const reason = delta > 0
      ? 'insufficient stock or product not found'
      : 'reserved count cannot drop below zero or product not found';
    throw new Error(`Failed to adjust reserved stock: ${reason}`);
  }

  return updated;
}

function createApiError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Get or create a cart for the given user.
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} The cart document
 */
async function getCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

/**
 * Add an item to the user's cart and reserve stock.
 *
 * @param {string} userId - The user's ID
 * @param {Object} data - { productId, quantity }
 * @returns {Promise<Object>} The updated cart
 */
async function addToCart(userId, { productId, quantity }) {
  const qty = quantity;

  const product = await Product.findOne({ productId: Number(productId) });
  if (!product) throw createApiError(404, 'Product not found');

  const available = product.stock == null ? Infinity : (product.stock - (product.reserved || 0));
  if (available < qty) throw createApiError(400, 'Insufficient stock available');

  let cart = await Cart.findOne({ userId });
  if (!cart) cart = new Cart({ userId, items: [] });

  const itemIdx = cart.items.findIndex(i => i.productId === Number(productId));
  if (itemIdx >= 0) {
    cart.items[itemIdx].quantity += qty;
  } else {
    cart.items.push({ productId: Number(productId), quantity: qty });
  }

  await adjustReserved(productId, qty);
  await cart.save();
  const fresh = await Cart.findOne({ userId });
  return fresh;
}

/**
 * Remove an item (or reduce its quantity) from the user's cart and release reserved stock.
 *
 * @param {string} userId - The user's ID
 * @param {Object} data - { productId, quantity }
 * @returns {Promise<Object>} The updated cart
 */
async function removeFromCart(userId, { productId, quantity }) {
  const qty = quantity;
  const cart = await Cart.findOne({ userId });
  if (!cart) throw createApiError(404, 'Cart not found');

  const itemIdx = cart.items.findIndex(i => i.productId === Number(productId));
  if (itemIdx === -1) throw createApiError(404, 'Item not in cart');

  const removeQty = Math.min(cart.items[itemIdx].quantity, qty);
  cart.items[itemIdx].quantity -= removeQty;
  if (cart.items[itemIdx].quantity <= 0) cart.items.splice(itemIdx, 1);

  await adjustReserved(productId, -removeQty);
  await cart.save();
  const fresh = await Cart.findOne({ userId });
  return fresh;
}

/**
 * Clear all items from the user's cart and release all reserved stock.
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} { success: true }
 */
async function clearCart(userId) {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw createApiError(404, 'Cart not found');

  for (const item of cart.items) {
    await adjustReserved(item.productId, -item.quantity);
  }

  cart.items = [];
  await cart.save();
  return { success: true };
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
