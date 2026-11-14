const mongoose = require('mongoose');

// A single prescription slot inside a program day. `_id: false` keeps the day
// array clean since entries are positional data, not addressable documents.
const programExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
    },
    sets: { type: Number },
    reps: { type: Number },
    restSeconds: { type: Number },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const programDaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number },
    focus: { type: String },
    exercises: { type: [programExerciseSchema], default: [] },
  },
  { _id: false }
);

// Schema structure only. Required-field rules, custom validators (day count
// matching `lengthDays`, unique day numbers, tag normalisation) and the
// supporting indexes are tracked separately in #985.
const ProgramSchema = new mongoose.Schema(
  {
    goal: { type: String },
    difficulty: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: '{VALUE} is not a supported difficulty',
      },
    },
    lengthDays: { type: Number, min: 1, max: 90 },
    day: { type: [programDaySchema], default: [] },
    tags: { type: [String], default: [] },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Program', ProgramSchema);
