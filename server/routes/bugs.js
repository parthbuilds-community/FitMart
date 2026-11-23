const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../lib/cloudinary');
const Bug = require('../models/Bug');
const { requireAuth } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/requireAdmin');
const admin = require('../firebaseAdmin');
const mongoose = require('mongoose');

function isValidEmailAddress(value) {
  if (typeof value !== 'string' || value.length > 254) return false;
  if (!value || value.includes(' ') || value.includes('\t') || value.includes('\r') ||
      value.includes('\n')) return false;

  const atIndex = value.indexOf('@');
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@') || atIndex === value.length - 1) {
    return false;
  }

  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return false;
  }
  for (const char of local) {
    if (!"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!#$%&'*+/=?^_`{|}~-".includes(char)) {
      return false;
    }
  }
  if (domain.length > 253 || domain.startsWith('.') || domain.endsWith('.') ||
      domain.includes('..')) {
    return false;
  }

  const domainLabels = domain.split('.');
  if (domainLabels.length < 2) return false;
  for (const label of domainLabels) {
    if (!label || label.startsWith('-') || label.endsWith('-')) return false;
    for (const char of label) {
      if (!"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-".includes(char)) {
        return false;
      }
    }
  }

  return true;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Use memory storage so serverless environments (Vercel) work correctly
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (file.mimetype && allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WebP, or GIF images are allowed'));
  },
});

// ── POST /api/bugs — public, accepts optional screenshot ──────────────────
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const { title, description, steps, pageUrl, browser } = req.body;
    let { reporterName, reporterEmail } = req.body;

    if (!title || !description)
      return res.status(400).json({ error: 'Title and description are required' });
    
    if (reporterEmail && !isValidEmailAddress(reporterEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    // Prefer authenticated name/email from token if present
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        const decoded = await admin.auth().verifyIdToken(token);
        reporterName = decoded.name || decoded.emailName || reporterName || decoded.uid;
        reporterEmail = decoded.email || reporterEmail || '';
      }
    } catch {
      // ignore token errors for public submissions
    }

    let screenshotUrl = '';
    let screenshotPublicId = '';
    if (req.file && req.file.buffer) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'fitmart/bugs',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        screenshotUrl = result.secure_url || '';
        screenshotPublicId = result.public_id || '';
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr);
        return res.status(500).json({ error: 'Failed to upload screenshot' });
      }
    }

    const bug = new Bug({
      title,
      description,
      steps,
      pageUrl,
      browser,
      reporterName,
      reporterEmail,
      screenshot: '',
      screenshotUrl,
      screenshotPublicId,
    });

    await bug.save();
    res.status(201).json({ ok: true, bug });
  } catch (err) {
    console.error('Error saving bug:', err);
    res.status(500).json({ error: 'Failed to submit bug' });
  }
});

// ── GET /api/bugs — admin only ────────────────────────────────────────────
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (Object.keys(req.query).some((key) => key.includes('$') || key.includes('.') || key.includes('['))) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
    if (Object.keys(req.query).some((key) =>
      /^(status|search|page|limit)(?:\.|\[)/.test(key)
    )) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
    if ((req.query.page !== undefined && typeof req.query.page !== 'string') ||
        (req.query.limit !== undefined && typeof req.query.limit !== 'string')) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }
    const pageValue = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limitValue = typeof req.query.limit === 'string' ? Number(req.query.limit) : 20;
    if (!Number.isInteger(pageValue) || pageValue < 1 ||
        !Number.isInteger(limitValue) || limitValue < 1 || limitValue > 50) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }
    const page = pageValue;
    const limit = limitValue;
    const skip = (page - 1) * limit;

    // Status filter
    if (req.query.status !== undefined && typeof req.query.status !== 'string') {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const status = req.query.status;
    if (status && !['open', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: open, in-progress, resolved' });
    }

    // Search filter (case-insensitive on title and description)
    if (req.query.search !== undefined && typeof req.query.search !== 'string') {
      return res.status(400).json({ error: 'Invalid search value' });
    }
    const search = req.query.search || '';
    const filter = {};
    if (status) filter.status = status;
    if (search && search.trim()) {
      const regex = { $regex: escapeRegex(search.trim()), $options: 'i' };
      filter.$or = [
        { title: regex },
        { description: regex },
      ];
    }

    const [bugs, total] = await Promise.all([
      Bug.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Bug.countDocuments(filter),
    ]);

    res.json({
      ok: true,
      bugs,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (err) {
    console.error('Error fetching bugs:', err);
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
});

// ── PATCH /api/bugs/:id — admin only ─────────────────────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'in-progress', 'resolved'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ error: 'Invalid bug ID' });

    const bug = await Bug.findByIdAndUpdate(
      new mongoose.Types.ObjectId(req.params.id),
      { $set: { status } },
      { returnDocument: 'after' }
    );
    if (!bug) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, bug });
  } catch (err) {
    console.error('Error updating bug:', err);
    res.status(500).json({ error: 'Failed to update bug' });
  }
});

module.exports = router;
