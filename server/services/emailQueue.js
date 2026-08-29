// server/services/emailQueue.js
const { Queue, createNodeRedisClient } = require('bullmq');
const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL is required for the email queue');
}
// Initialize the native Redis client
const redisClient = createClient({ url: redisUrl });

// Handle connection errors to prevent unhandled promise rejections
redisClient.on('error', (err) => {
  console.error('[BullMQ Redis] Connection Error:', err.message);
});

// Wrap the native client using BullMQ's adapter
// Note: BullMQ handles the connect() lifecycle automatically via the adapter
const connection = createNodeRedisClient(redisClient);

// Create the Queue instance
const emailQueue = new Queue('EmailQueue', {
  connection
});

/**
 * Enqueue a new email job
 * @param {string} jobName - Name of the job (e.g., 'firstPurchaseEmail')
 * @param {Object} payload - Data required to process the job
 */
async function enqueueEmailJob(jobName, payload) {
  try {
    const job = await emailQueue.add(jobName, payload, {
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 1000, // Wait 1s, 2s, 4s between retries
      },
    });
    
    console.log(`✅ [EmailQueue] Enqueued job ${job.id} for ${jobName}`);
    return job;
  } catch (error) {
    console.error(`❌ [EmailQueue] Failed to enqueue job ${jobName}:`, error.message);
    throw error;
  }
}

module.exports = {
  emailQueue,
  enqueueEmailJob,
};
