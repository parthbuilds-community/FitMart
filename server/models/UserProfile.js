const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    isFirstLogin: { type: Boolean, default: true },
    discountUsed: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 10 },

    email: { type: String },
    firstPurchaseEmailSentAt: { type: Date },
    lastReminderEmailSentAt: { type: Date },

    name: { type: String },
    phone: { type: String },
    photoURL: { type: String },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    addresses: [
      {
        id: { type: String },
        label: { type: String },
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        country: { type: String },
        phone: { type: String },
      },
    ],

    defaultAddressId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);