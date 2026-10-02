const mongoose = require('mongoose');

// A single prescription slot inside a program day. `_id: false` keeps the day
// array clean since entries are positional data, not addressable documents.
const programExerciseSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: [true, 'Each exercise slot must reference an exercise'],
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
    dayNumber: {
      type: Number,
      required: [true, 'Each day must have a day number'],
    },
    focus: { type: String, trim: true },
    exercises: {
      type: [programExerciseSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Each program day must contain at least one exercise',
      },
    },
  },
  { _id: false }
);

// Programme schema with the #985 validation rules layered on top of the #984
// structure: every field a catalogue entry needs is required, the day array has
// to agree with `lengthDays`, day numbers are unique and tags are normalised.
const ProgramSchema = new mongoose.Schema(
  {
    goal: {
      type: String,
      required: [true, 'goal is required'],
      trim: true,
      minlength: [5, 'goal must be at least 5 characters'],
      maxlength: [120, 'goal must be at most 120 characters'],
    },
    difficulty: {
      type: String,
      required: [true, 'difficulty is required'],
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: '{VALUE} is not a supported difficulty',
      },
    },
    lengthDays: {
      type: Number,
      required: [true, 'lengthDays is required'],
      min: [1, 'lengthDays must be at least 1'],
      max: [90, 'lengthDays must be at most 90'],
    },
    day: {
      type: [programDaySchema],
      required: [true, 'day is required'],
      validate: [
        {
          validator: (value) => Array.isArray(value) && value.length > 0,
          message: 'A program must contain at least one day',
        },
        {
          validator(value) {
            const numbers = value.map((entry) => entry.dayNumber);
            return new Set(numbers).size === numbers.length;
          },
          message: 'Program day numbers must be unique',
        },
        {
          validator(value) {
            // `lengthDays` is validated separately; only cross-check it once it
            // is present so a missing value reports the single, clearer error.
            return this.lengthDays === undefined || value.length === this.lengthDays;
          },
          message: 'lengthDays must match the number of day entries',
        },
      ],
    },
    tags: {
      type: [String],
      default: [],
      // Normalise on assignment so every lookup (which is case-insensitive
      // anyway) and every stored document agree on 'strength', not ' Strength '.
      set: (tags) =>
        Array.isArray(tags)
          ? tags.map((tag) => String(tag).trim().toLowerCase()).filter((tag) => tag.length > 0)
          : tags,
      validate: {
        validator: (value) => value.length <= 10,
        message: 'A program can have at most 10 tags',
      },
    },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

ProgramSchema.index({ difficulty: 1, createdAt: -1 });
ProgramSchema.index({ tags: 1 });
ProgramSchema.index({ goal: 1 });
ProgramSchema.index({ goal: 1, difficulty: 1 }, { unique: true });

module.exports = mongoose.model('Program', ProgramSchema);
