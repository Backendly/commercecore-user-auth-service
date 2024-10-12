// config/redis.js
const Redis = require('ioredis');

const redisURL = process.env.REDIS_URL;

const client = new Redis(redisURL, {
    connectTimeout: 10000, // Increase the timeout to 10000ms (10 seconds)
    enableReadyCheck: false, // Disable ready check
    maxRetriesPerRequest: null // Disable max retries per request
});

client.on('error', (err) => {
    console.log('Redis error: ', err);
});

client.on('connect', () => {
    console.log('Connected to Redis via URL!');
});

module.exports = client;