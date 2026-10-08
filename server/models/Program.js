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

// What it costs to enrol in a program. A membership copies this into its own
// `priceSnapshot` at enrolment time so later price edits never rewrite the
// revenue history of members who already joined.
const programPriceSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    interval: { type: String, required: true },
    periodDays: { type: Number, required: true },
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
    // Optional. A program without a price cannot be enrolled in, so the
    // sub-document stays fully absent (`default: undefined`) instead of
    // materialising as `{}` and producing a half-filled priceSnapshot.
    price: { type: programPriceSchema, default: undefined },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Program', ProgramSchema);
