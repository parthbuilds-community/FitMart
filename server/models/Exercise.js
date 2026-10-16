const mongoose = require('mongoose');

// Minimal Exercise catalogue entry matching PR #1023 / PR #1038 / docs/PROGRAM_MODEL.md.
// Program days reference this collection so GET /api/programs/:id can populate
// name, muscleGroup, equipment, and image.
const ExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    muscleGroup: {
      type: String,
      required: [true, 'muscleGroup is required'],
      trim: true,
    },
    equipment: {
      type: String,
      required: [true, 'equipment is required'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

ExerciseSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Exercise', ExerciseSchema);
