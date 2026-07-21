const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    productId: { type: Number, unique: true, required: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    category: { type: String, trim: true },
    price: { type: Number, required: true, min: [0, 'price cannot be negative'] },
    originalPrice: { type: Number, default: null, min: [0, 'originalPrice cannot be negative'] },
    rating: { type: Number, default: 0, min: [0, 'rating cannot be negative'] },
    reviews: { type: Number, default: 0, min: [0, 'reviews cannot be negative'] },
    badge: { type: String, default: null, trim: true },
    image: { type: String, default: '', trim: true },
    // total stock available (optional). If null, stock is not enforced.
    stock: { type: Number, default: null, min: [0, 'stock cannot be negative'] },
    // quantity reserved by carts (sum of quantities currently in carts)
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'reserved cannot be negative'],
    },
  },
  { timestamps: true }
);

// Indexes to support efficient filtering/sorting
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 'text' });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
