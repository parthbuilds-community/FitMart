const mongoose = require("mongoose");

const fitnessCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["gym", "yoga", "pilates", "fitness_studio"], required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    rating: { type: Number, min: 0, max: 5, default: 4.0 },
    totalReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      "5star": { type: Number, default: 0 },
      "4star": { type: Number, default: 0 },
      "3star": { type: Number, default: 0 },
      "2star": { type: Number, default: 0 },
      "1star": { type: Number, default: 0 }
    },
    imageUrl: { type: String },
    gallery: { type: [String], default: [] },
    contact: { type: String },
    alternateContact: { type: String },
    email: { type: String },
    website: { type: String },
    isOpen: { type: Boolean, default: true },
    openingHours: {
      monday: { type: String },
      tuesday: { type: String },
      wednesday: { type: String },
      thursday: { type: String },
      friday: { type: String },
      saturday: { type: String },
      sunday: { type: String }
    },
    amenities: { type: [String], default: [] },
    membershipPlans: [
      {
        plan: { type: String },
        price: { type: Number },
        currency: { type: String }
      }
    ],
    trainers: { type: Number, default: 0 },
    capacity: { type: Number },
    established: { type: Number },
    description: { type: String },
    specialties: { type: [String], default: [] },
    paymentMethods: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FitnessCenter", fitnessCenterSchema);

