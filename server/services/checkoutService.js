const Cart = require("../models/Cart");
const Product = require("../models/Product");
const UserProfile = require("../models/UserProfile");

/**
 * Calculates authoritative server-side checkout values for the authenticated user.
 * Rejects empty carts, missing products, non-positive quantities, and invalid stock.
 * Calculates subtotal strictly from database product prices and applies the welcome discount.
 *
 * @param {string} userId - Authenticated user Firebase UID
 * @returns {Promise<{items: Array, subtotal: number, discountEligible: boolean, discountPercent: number, discountAmount: number, total: number}>}
 */
async function calculateCheckout(userId) {
  const cart = await Cart.findOne({ userId });

  if (!cart || !cart.items.length) {
    throw new Error("Cart is empty");
  }

  const items = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = await Product.findOne({
      productId: Number(item.productId),
    });

    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(
        `Invalid quantity for product ${item.productId}`
      );
    }

    // Preserve repository semantics: cart quantities are already reserved inside
    // product.reserved. For finite stock, ensure stock has not dropped below item.quantity.
    if (product.stock !== null && product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}`
      );
    }

    items.push({
      productId: product.productId,
      quantity: item.quantity,
      price: product.price,
    });

    subtotal += product.price * item.quantity;
  }

  const profile = await UserProfile.findOne({ userId });

  const discountEligible =
    Boolean(profile) && profile.discountUsed === false;

  const discountPercent = discountEligible
    ? Number(profile.discountPercent || 0)
    : 0;

  const discountAmount = discountEligible
    ? Math.round(
        (subtotal * discountPercent) / 100
      )
    : 0;

  const total = Math.max(
    0,
    subtotal - discountAmount
  );

  return {
    items,
    subtotal,
    discountEligible,
    discountPercent,
    discountAmount,
    total,
  };
}

module.exports = {
  calculateCheckout,
};