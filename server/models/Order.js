const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },

    items: { type: [OrderItemSchema], required: true },

    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ['created', 'paid', 'failed'], // 👈 better control
      default: 'created'
    },


    paymentId: {
      type: String,
      unique: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);