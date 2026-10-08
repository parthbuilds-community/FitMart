const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const Program = require('../models/Program');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const validateRequest = require('../middleware/validateRequest');
const {
  createMembershipSchema,
  listMembershipsSchema,
} = require('../validation/requestSchemas');
const { ok, fail } = require('../utils/apiResponse');

// Ownership + admin checks, mirroring the pattern in server/routes/user.js
// (and the env vars read by server/middleware/verifyAdmin.js).
const ADMIN_UID = process.env.ADMIN_UID || process.env.VITE_ADMIN_UID || '';
const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID || process.env.VITE_SUPER_ADMIN_UID || '';
const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || '';
const isDev = process.env.NODE_ENV !== 'production';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// "-renewCount" means descending; the plain field name means ascending. The set
// of allowed fields is enforced by listMembershipsSchema, so this only needs to
// translate the direction.
function buildSort(sort) {
  const descending = sort.startsWith('-');
  const field = descending ? sort.slice(1) : sort;
  return { [field]: descending ? -1 : 1 };
}

function isAdminUser(req) {
  if (ADMIN_UID && req.user.uid === ADMIN_UID) return true;
  if (SUPER_ADMIN_UID && req.user.uid === SUPER_ADMIN_UID) return true;
  if (isDev) {
    if (DEV_ADMIN_EMAIL && req.user.email && req.user.email === DEV_ADMIN_EMAIL) return true;
    if (process.env.DEV_ADMIN_UID && req.user.uid === process.env.DEV_ADMIN_UID) return true;
  }
  return false;
}

/**
 * @route   POST /api/memberships
 * @desc    Enrol the authenticated user in a program (admins may enrol someone
 *          else by passing userId)
 * @access  Private
 */
router.post('/', verifyFirebaseToken, validateRequest(createMembershipSchema), async (req, res) => {
  try {
    const { planId, userId } = req.body;
    const targetUserId = userId || req.user.uid;

    // Enrolling yourself needs no special rights; enrolling somebody else is
    // an admin-only override.
    if (targetUserId !== req.user.uid && !isAdminUser(req)) {
      return fail(res, 'Forbidden — you can only enrol your own account', 403);
    }

    const program = await Program.findById(planId)
      .select('goal difficulty lengthDays image price')
      .lean();

    if (!program) return fail(res, 'Program not found', 404);

    // Both fields are needed to open a membership: the price is snapshotted
    // onto it and lengthDays derives the expiry date. #985 will make them
    // required on the model, so this is the interim guard.
    if (!program.price) {
      return fail(res, 'Program has no price configured', 400);
    }
    if (!Number.isFinite(program.lengthDays) || program.lengthDays <= 0) {
      return fail(res, 'Program is missing a valid lengthDays', 400);
    }

    // Best-effort guard: two concurrent enrolments could both pass this read.
    // #992 adds the partial unique index on { userId, planId } restricted to
    // status 'active', which makes the constraint airtight at the database.
    const existing = await Membership.findOne({
      userId: targetUserId,
      planId,
      status: 'active',
    });
    if (existing) {
      return fail(res, 'An active membership for this program already exists', 409);
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + program.lengthDays * DAY_MS);

    const membership = await Membership.create({
      userId: targetUserId,
      planId,
      status: 'active',
      renewCount: 0,
      priceSnapshot: {
        amount: program.price.amount,
        currency: program.price.currency,
        interval: program.price.interval,
        periodDays: program.price.periodDays,
      },
      currentDayIndex: 0,
      startedAt,
      enrolledAt: startedAt,
      expiresAt,
    });

    // Re-read so the response carries exactly the documented program fields
    // and never leaks the internal version key.
    const populated = await Membership.findById(membership._id)
      .select('-__v')
      .populate({ path: 'planId', select: 'goal difficulty lengthDays image' })
      .lean();

    return ok(res, { data: { membership: populated } }, 201);
  } catch (err) {
    console.error('[memberships] POST /api/memberships error:', err);
    return fail(res, 'Failed to create membership', 500);
  }
});

/**
 * @route   GET /api/memberships
 * @desc    List memberships with pagination, status filtering and sorting.
 *          Regular users see only their own; admins see every membership.
 * @access  Private
 */
router.get('/', verifyFirebaseToken, validateRequest(listMembershipsSchema), async (req, res) => {
  try {
    // Express 5 exposes req.query as a getter, so validateRequest's assignment
    // of the parsed object is a no-op until #990 lands. Read defaults and
    // coercion here so the endpoint behaves identically either way.
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const sort =
      typeof req.query.sort === 'string' && req.query.sort
        ? req.query.sort
        : '-createdAt';
    const status = req.query.status;

    const filter = {};
    // Admins see every membership; everybody else is scoped to their own uid.
    if (!isAdminUser(req)) filter.userId = req.user.uid;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [memberships, total] = await Promise.all([
      Membership.find(filter)
        .select('-__v')
        .sort(buildSort(sort))
        .skip(skip)
        .limit(limit)
        .populate({ path: 'planId', select: 'goal difficulty lengthDays image' })
        .lean(),
      Membership.countDocuments(filter),
    ]);

    return ok(res, {
      data: {
        memberships,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error('[memberships] GET /api/memberships error:', err);
    return fail(res, 'Failed to fetch memberships', 500);
  }
});

module.exports = router;
