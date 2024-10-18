// publisher.js
const { client1 } = require('../config/redis');

const publishProfileDeleted = async (type, id) => {
  const channel = 'profileDeleted';
  const message = JSON.stringify({ type, id, timestamp: new Date() });
  
  await client1.publish(channel, message); // Publish using client1
};

module.exports = {
  publishProfileDeleted,
};
