const mongoose = require("mongoose");

const fitnessCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    type: {
      type: String,
      enum: ["gym", "yoga", "pilates", "fitness_studio"],
      required: true,
    },

    address: String,
    city: String,
    state: String,

    postalCode: String,
    country: String,

    lat: Number,
    lng: Number,

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.0,
    },

    totalReviews: Number,

    ratingBreakdown: {
      "5star": Number,
      "4star": Number,
      "3star": Number,
      "2star": Number,
      "1star": Number,
    },

    imageUrl: String,

    gallery: [String],

    contact: String,
    alternateContact: String,

    email: String,
    website: String,

    isOpen: {
      type: Boolean,
      default: true,
    },

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