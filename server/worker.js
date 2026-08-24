// server/worker.js
require('dotenv').config();

// Establish the MongoDB connection (required for future email logic)
require('./db');

const { Worker, createNodeRedisClient } = require('bullmq');
const { createClient } = require('redis');
const { sendFirstPurchaseEmail } = require('./services/firstPurchaseEmailService');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// 1. Initialize the native Redis client using the existing approach
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => {
  console.error('[BullMQ Worker Redis] Connection Error:', err.message);
});

// 2. Wrap the native client using BullMQ's adapter
const connection = createNodeRedisClient(redisClient);

// 3. Initialize the Worker
console.log('👷 Starting BullMQ EmailWorker...');

const emailWorker = new Worker(
  'EmailQueue',
  async (job) => {
    console.log(`\n========================================`);
    console.log(`📥 Received Job ID: ${job.id}`);
    console.log(`🏷️  Job Name: ${job.name}`);
    console.log(`📦 Payload:`, JSON.stringify(job.data, null, 2));
    console.log(`========================================\n`);

    if (job.name === 'firstPurchaseEmail') {
      const { userId, orderData, isFirstPurchase } = job.data;

      // The first-purchase decision was made when the payment was completed.
      // Do not recalculate it here because other purchases may have happened
      // while this job was waiting in the queue.
      if (!isFirstPurchase) {
        console.log(
          `ℹ️ Not the first purchase for user ${userId}; skipping email`
        );

        return {
          success: true,
          skipped: true,
          message: 'Not the first purchase',
        };
      }

      const result = await sendFirstPurchaseEmail(userId, orderData);

      if (!result || result.error) {
        throw new Error(
          `Email failed to send: ${result?.message || 'Unknown error'} ${
            result?.error || ''
          }`
        );
      }

      return result;
    }

    return {
      success: true,
      message: 'Test consumption successful',
    };
  },
  {
    connection,
  }
);

emailWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

// 4. Graceful Shutdown Handling
async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}, closing worker gracefully...`);

  try {
    // await emailWorker.close() waits for currently processing jobs to finish before disconnecting
    await emailWorker.close();
    console.log('👋 Worker closed. Exiting process.');
    process.exit(0);
  } catch (err) {
    console.error('⚠️ Error during graceful shutdown:', err);
    process.exit(1);
  }
}

// Listen for termination signals from Docker (SIGTERM) or Ctrl+C (SIGINT)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

console.log('🎧 EmailWorker is actively listening for jobs on EmailQueue...');