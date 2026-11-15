const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);