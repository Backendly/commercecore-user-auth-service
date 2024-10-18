// queue/deleteProfileQueue.js
/*const Queue = require('bull');
const prisma = require('../config/db');
const { client1 } = require('../config/redis'); // Use client1 for queue
const Redis = require('ioredis');

// Create a new Bull queue
const deleteProfileQueue = new Queue('deleteProfile', {
  createClient: function (type) {
    switch (type) {
      case 'client':
        return client1; // Use client1 for the queue
      case 'subscriber':
        return client1.duplicate(); // Duplicate client1 for subscriber
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

    // Optionally, delete related tokens
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
**/