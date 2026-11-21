const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    productId: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    brand: { type: String },
    category: { type: String },
    price: { type: Number, required: true },
    // Authoritative integer price in paise. `price` remains as a display value
    // until the storefront is ported to integer money in Phase 3.
    priceMinor: {
      type: Number,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'priceMinor must be an integer number of paise',
      },
    },
    originalPrice: { type: Number, default: null },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    badge: { type: String, default: null },
    image: { type: String, default: '' },
    // total stock available (optional). If null, stock is not enforced.
      stock: {
    type: Number,
    default: null,
    validate: {
      validator: function(v) {
        // If it's null (unlimited), it's valid.
        // If it's a number, it must be 0 or greater.
        return v === null || v >= 0;
      },
      message: 'Stock cannot be negative'
    }
  },
    // quantity reserved by carts (sum of quantities currently in carts)
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'reserved cannot be negative'],
    },
    // soft archive (ADR-13); archived products cannot enter a new quote
    isActive: { type: Boolean, default: true, index: true },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Keep integer paise in sync whenever the rupee price is written through save().
ProductSchema.pre('validate', function syncPriceMinor() {
  if (this.price == null) return;
  if (!Number.isInteger(this.priceMinor) || this.isModified('price')) {
    this.priceMinor = Math.round(Number(this.price) * 100);
  }
});

// Indexes to support efficient filtering/sorting
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 'text' });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
