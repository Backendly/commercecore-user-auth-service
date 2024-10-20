// redis.js
const Redis = require('ioredis');

// First Redis connection (remote Redis for queue and publisher)
//const redisURL = process.env.REDIS_URL;
/*const client1 = new Redis(redisURL, {
    connectTimeout: 10000,
    enableReadyCheck: false,
    maxRetriesPerRequest: null
});

client1.on('error', (err) => {
    console.log('Redis 1 error: ', err);
});

client1.on('connect', () => {
    console.log('Connected to remote Redis via URL!');
});
*/

// Second Redis connection ( Redis for caching)
const redisURL = process.env.REDIS_URL;
const client2 = new Redis(redisURL, {
    connectTimeout: 10000,
    enableReadyCheck: false,
    maxRetriesPerRequest: null
});

client2.on('error', (err) => {
    console.log('Redis 2 error: ', err);
});

client2.on('connect', () => {
    console.log('Connected to local Redis on port 6379!');
});

// Export both clients
module.exports = {
    //client1, // Remote Redis (for queue and publisher)
    client2  // Local Redis (for caching)
};
