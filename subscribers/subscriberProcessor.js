// subscribers/subscriberProcessor.js
const { subscribeToProfileDeleted } = require('./profileSubscriber');

// Start the subscriber
(async () => {
  try {
    await subscribeToProfileDeleted();
    console.log('Subscriber is running and listening for profile deletion events.');
  } catch (error) {
    console.error('Error starting subscriber:', error);
  }
})();