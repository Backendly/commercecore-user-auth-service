// publishers/profilePublisher.js
const redisClient = require('../config/redis');

const publishProfileDeleted = async (type, id) => {
  const channel = 'profileDeleted';
  const message = JSON.stringify({ type, id, timestamp: new Date() });
  await redisClient.publish(channel, message);
};

module.exports = {
  publishProfileDeleted,
};