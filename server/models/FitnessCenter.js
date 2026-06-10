const mongoose = require("mongoose");

const fitnessCenterSchema = new mongoose.Schema(
  {
    // Existing fields
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["gym", "yoga", "pilates", "fitness_studio"],
      required: true,
    },
    address: String,
    city: String,
    state: String,
    lat: Number,
    lng: Number,
    rating: { type: Number, min: 0, max: 5, default: 4.0 },
    imageUrl: String,
    contact: String,
    isOpen: { type: Boolean, default: true },

    // New fields
    postalCode: String,
    country: String,
    totalReviews: Number,

    ratingBreakdown: {
      "5star": Number,
      "4star": Number,
      "3star": Number,
      "2star": Number,
      "1star": Number,
    },

    gallery: [String],

    alternateContact: String,
    email: String,
    website: String,

    openingHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
    },

    amenities: [String],

    membershipPlans: [
      {
        plan: String,
        price: Number,
        currency: String,
      },
    ],

    trainers: Number,
    capacity: Number,
    established: Number,

    description: String,

    specialties: [String],

    paymentMethods: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("FitnessCenter", fitnessCenterSchema);