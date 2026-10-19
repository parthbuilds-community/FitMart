const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bodyPart: {
      type: String,
      required: true,
      trim: true,
    },
    equipment: {
      type: String,
      default: 'Bodyweight',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
