const Queue = require('bull');
const prisma = require('../config/db'); // Import Prisma instance
const redisClient = require('../config/redis'); // Import Redis client
const Redis = require('ioredis'); // Import Redis from ioredis

// Create a new Bull queue using the existing Redis client
const deleteProfileQueue = new Queue('deleteProfile', {
  createClient: function (type) {
    switch (type) {
      case 'client':
        return redisClient;
      case 'subscriber':
        return redisClient.duplicate();
      default:
        return new Redis(process.env.REDIS_URL, {
          enableReadyCheck: false,
          maxRetriesPerRequest: null
        });
    }
  },
});

// Process the job
deleteProfileQueue.process(async (job) => {
  const { developerId } = job.data;

  try {
    // Delete developer profile
    await prisma.developer_profiles.delete({
      where: { developer_id: developerId },
    });

    // Delete developer record
    await prisma.developers.delete({
      where: { id: developerId },
    });

    // Optionally, delete related tokens and other data
    await prisma.tokens.deleteMany({
      where: { developer_id: developerId },
    });

    console.log(`Successfully deleted developer with ID: ${developerId}`);
    return Promise.resolve();
  } catch (error) {
    console.error('Error processing deleteProfileQueue job:', error);
    return Promise.reject(error);
  }
});

module.exports = deleteProfileQueue;