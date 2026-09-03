const mongoose = require('mongoose');

/**
 * Defines an exercise entry inside a program day.
 */
const programExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
  },
  sets: Number,
  reps: Number,
  restSeconds: Number,
  notes: String
}, { _id: false });

/**
 * Defines a single day in a workout program.
 */
const programDaySchema = new mongoose.Schema({
  dayNumber: Number,
  focus: String,
  exercises: {
    type: [programExerciseSchema],
    default: []
  }
}, { _id: false });

/**
 * Defines the main workout program structure.
 */
const programSchema = new mongoose.Schema({
  goal: String,
  difficulty: String,
  lengthDays: Number,
  day: {
    type: [programDaySchema],
    default: []
  },
  tags: [String],
  image: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Program', programSchema);
