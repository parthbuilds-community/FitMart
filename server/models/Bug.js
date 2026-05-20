const mongoose = require('mongoose');

const BugSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    steps: { type: String, default: '' },
    pageUrl: { type: String, default: '' },
    browser: { type: String, default: '' },
    reporterName: { type: String, default: '' },
    reporterEmail: { type: String, default: '' },
    // allowed statuses: open, in-progress, resolved
    // legacy local path (kept for backward compatibility)
    screenshot: { type: String, default: '' }, // previously relative path under /uploads/bugs/
    // new Cloudinary-hosted URL
    screenshotUrl: { type: String, default: '' },
    screenshotPublicId: { type: String, default: '' },
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bug', BugSchema);
