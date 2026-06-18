// server/models/UserProfile.js
const mongoose = require("mongoose");

const emailValidator = {
  validator: function(v) {
    if (v === null || v === undefined || v === '') return true;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
  },
  message: props => `${props.value} is not a valid email address!`
};

const phoneValidator = {
  validator: function(v) {
    if (v === null || v === undefined || v === '') return true;
    return /^\+?[\d\s\-]{7,20}$/.test(v);
  },
  message: props => `${props.value} is not a valid phone number!`
};

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // Firebase UID
    isFirstLogin: { type: Boolean, default: true },              // false after first login banner is shown
    discountUsed: { type: Boolean, default: false },              // true after first order is placed
    discountPercent: { type: Number, default: 10 },              // 10% welcome discount
    // Email and first-purchase tracking
    email: { type: String, validate: emailValidator },                                       // User's email address (synced from Firebase)
    firstPurchaseEmailSentAt: { type: Date },                     // Timestamp when first-purchase email was sent
    lastReminderEmailSentAt: { type: Date },                      // Timestamp when inactivity reminder email was sent
    // Profile fields
    name: { type: String },
    phone: { type: String, validate: phoneValidator },
    photoURL: { type: String },
    // Addresses array for checkout/shipping
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
        phone: { type: String, validate: phoneValidator },
      },
    ],
    defaultAddressId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);