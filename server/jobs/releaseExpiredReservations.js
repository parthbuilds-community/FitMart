const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { adjustReserved } = require('../routes/cart');

const EXPIRY_MINUTES = 30;

async function releaseExpiredReservations() {
  try {
    const expiryTime = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);

    const carts = await Cart.find({
      'items.reservedAt': { $lt: expiryTime },
    });

    for (const cart of carts) {
      let modified = false;

      for (const item of cart.items) {
        if (item.reservedAt && item.reservedAt < expiryTime) {
          try {
            await adjustReserved(item.productId, -item.quantity);
            item.quantity = 0;
            modified = true;
          } catch (err) {
            console.error('Failed to release reservation:', err.message);
          }
        }
      }

      if (modified) {
        cart.items = cart.items.filter(i => i.quantity > 0);
        await cart.save();
      }
    }

    console.log(`[CLEANUP] Released expired reservations at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[CLEANUP ERROR]', err);
  }
}

module.exports = releaseExpiredReservations;