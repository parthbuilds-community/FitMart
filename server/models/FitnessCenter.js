const mongoose = require("mongoose");

const fitnessCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["gym", "yoga", "pilates", "fitness_studio"], required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    rating: { type: Number, min: 0, max: 5, default: 4.0 },
    imageUrl: { type: String },
    contact: { type: String },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FitnessCenter", fitnessCenterSchema);
