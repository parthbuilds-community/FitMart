const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    // Legacy rupee snapshot. Order history keeps both until the client is
    // ported to integer money.
    price: { type: Number, required: true },
    priceMinor: {
      type: Number,
      min: 0,
      validate: { validator: Number.isInteger, message: 'priceMinor must be an integer' },
    },
    lineTotalMinor: {
      type: Number,
      min: 0,
      validate: { validator: Number.isInteger, message: 'lineTotalMinor must be an integer' },
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },

    items: { type: [OrderItemSchema], required: true },

    total: { type: Number, required: true },

    subtotalMinor: {
      type: Number,
      min: 0,
      validate: { validator: Number.isInteger, message: 'subtotalMinor must be an integer' },
    },
    shippingMinor: {
      type: Number,
      min: 0,
      default: 0,
      validate: { validator: Number.isInteger, message: 'shippingMinor must be an integer' },
    },
    totalMinor: {
      type: Number,
      min: 0,
      validate: { validator: Number.isInteger, message: 'totalMinor must be an integer' },
    },
    currency: { type: String, default: 'INR' },

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