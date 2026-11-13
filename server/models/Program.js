const mongoose = require('mongoose');

const programDaySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    focus: {
      type: String,
      required: true,
      trim: true,
    },
    exercises: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Exercise',
        },
      ],
      required: true,
      validate: {
        validator: (exercises) =>
          exercises.length >= 4 && exercises.length <= 8,
        message: 'Each program day must contain 4–8 exercises',
      },
    },
  },
  { _id: false }
);

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    goal: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: [
        'Beginner',
        'Beginner-Intermediate',
        'Intermediate',
        'Advanced',
      ],
      required: true,
    },
    lengthDays: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'lengthDays must be a whole number',
      },
    },
    days: {
      type: [programDaySchema],
      required: true,
      validate: {
        validator: function (days) {
          return (
            days.length === this.lengthDays &&
            days.every((day, index) => day.dayNumber === index + 1)
          );
        },
        message:
          'Programs must contain one correctly numbered schedule for every day',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

programSchema.index({ difficulty: 1, goal: 1 });

module.exports = mongoose.model('Program', programSchema);
