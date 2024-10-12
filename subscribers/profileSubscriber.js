// subscribers/profileSubscriber.js
const redisClient = require('../config/redis');

const subscribeToProfileDeleted = async () => {
  const channel = 'profileDeleted';
  const subscriber = redisClient.duplicate();

  await subscriber.connect();

  subscriber.on('message', (channel, message) => {
    const data = JSON.parse(message);
    console.log(`Received message from ${channel}:`, data);
    // Handle the profile deleted event
    if (data.type === 'user') {
      console.log(`User profile with ID ${data.id} was deleted.`);
    } else if (data.type === 'developer') {
      console.log(`Developer profile with ID ${data.id} was deleted.`);
    }
  });

  await subscriber.subscribe(channel);
};

module.exports = {
  subscribeToProfileDeleted,
};