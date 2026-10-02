const mongoose = require('mongoose');

// Minimal Exercise catalogue entry. This exists so program days can reference a
// real collection and GET /api/programs/:id can populate the fields it promises
// (name, muscleGroup, equipment, image).
//
// The fuller Exercise model plus realistic seed data are tracked in #1001.
const ExerciseSchema = new mongoose.Schema(
  {
    name: { type: String },
    muscleGroup: { type: String },
    equipment: { type: String },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exercise', ExerciseSchema);
