const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    bodyPart: {
      type: String,
      required: true,
    },

    target: {
      type: String,
      required: true,
    },

    equipment: {
      type: String,
      default: "bodyweight",
    },

    gifUrl: {
      type: String,
      default: "",
    },

    instructions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", exerciseSchema);