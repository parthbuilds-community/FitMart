const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
// Required (even though it is not referenced directly) so Mongoose has the
// 'Exercise' model registered when the detail route populates references.
require('../models/Exercise');
const validateRequest = require('../middleware/validateRequest');
const { listProgramsSchema, programDetailSchema } = require('../validation/requestSchemas');
const { ok, fail } = require('../utils/apiResponse');

// User input reaches MongoDB's $regex, so metacharacters must be neutralised.
// Without this a search like "[" throws and a crafted pattern can match more
// than the caller asked for.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// "-lengthDays" means descending; the plain field name means ascending.
function buildSort(sort) {
  const descending = sort.startsWith('-');
  const field = descending ? sort.slice(1) : sort;
  return { [field]: descending ? -1 : 1 };
}

// Inclusion projection when `fields` is supplied, otherwise a plain exclusion of
// the internal version key so it cannot leak into API responses.
function buildProjection(fields) {
  if (!fields) return { __v: 0 };

  return fields.split(',').reduce((projection, field) => {
    const name = field.trim();
    if (name) projection[name] = 1;
    return projection;
  }, {});
}

/**
 * @route   GET /api/programs
 * @desc    Public program catalog with pagination, filtering, search, sorting
 * @access  Public
 */
router.get('/', validateRequest(listProgramsSchema), async (req, res) => {
  try {
    const { page, limit, difficulty, tag, search, sort, fields } = req.query;

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = { $regex: `^${escapeRegex(tag)}$`, $options: 'i' };
    if (search) {
      const pattern = { $regex: escapeRegex(search), $options: 'i' };
      filter.$or = [{ goal: pattern }, { tags: pattern }];
    }

    const skip = (page - 1) * limit;

    const [programs, total] = await Promise.all([
      Program.find(filter, buildProjection(fields))
        .sort(buildSort(sort))
        .skip(skip)
        .limit(limit)
        .lean(),
      Program.countDocuments(filter),
    ]);

    return ok(res, {
      data: {
        programs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error('[programs] GET /api/programs error:', err);
    return fail(res, 'Failed to fetch programs', 500);
  }
});

/**
 * @route   GET /api/programs/:id
 * @desc    Public program detail with populated exercise references
 * @access  Public
 */
router.get('/:id', validateRequest(programDetailSchema), async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .select('-__v')
      .populate({
        path: 'day.exercises.exerciseId',
        select: 'name muscleGroup equipment image',
      })
      .lean();

    if (!program) return fail(res, 'Program not found', 404);

    // Days are stored in creation order; return them in program order so the
    // timeline is stable regardless of how the document was written. dayNumber is
    // still optional until #985 adds its validators, so fall back to 0 rather
    // than letting the comparator return NaN.
    if (Array.isArray(program.day)) {
      program.day.sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));
    }

    return ok(res, { data: { program } });
  } catch (err) {
    console.error('[programs] GET /api/programs/:id error:', err);
    return fail(res, 'Failed to fetch program', 500);
  }
});

module.exports = router;
