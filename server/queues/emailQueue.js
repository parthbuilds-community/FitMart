const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const { sendEmail } = require('../services/emailService');

// Retrieve Redis connection string, or fallback to default localhost
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Initialize Redis connection
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Create the email queue
const emailQueue = new Queue('email-queue', { connection });

// Create the worker to process email jobs
const emailWorker = new Worker('email-queue', async (job) => {
  console.log(`[BullMQ] Processing email job ${job.id} for ${job.data.to}`);
  
  const result = await sendEmail(job.data);
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to send email');
  }
  
  console.log(`[BullMQ] Successfully processed email job ${job.id}`);
  return result;
}, { connection });

// Handle worker events
emailWorker.on('completed', (job) => {
  console.log(`[BullMQ] Job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] Job ${job.id} has failed with ${err.message}`);
});

module.exports = { emailQueue, emailWorker };
