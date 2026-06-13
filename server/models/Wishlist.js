const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  items: [{ productId: { type: Number, required: true } }]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);