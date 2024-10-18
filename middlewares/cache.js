const { client2 } = require('../config/redis');

// Cache data with a 1-hour expiration
const cacheData = async (key, data) => {
  console.log(`Caching data with key: ${key}`);
  await client2.set(key, JSON.stringify(data), 'EX', 3600); // Expire after 1 hour
};

// Retrieve cached data
const getCachedData = async (key) => {
  const cached = await client2.get(key);
  console.log(`Retrieving data with key: ${key}, found: ${!!cached}`);
  return cached ? JSON.parse(cached) : null;
};

// Middleware function to attach cache methods to req object
const cacheMiddleware = (req, res, next) => {
  req.cache = {
    get: getCachedData,
    set: cacheData
  };
  console.log('Cache middleware attached to request');
  next();
};

module.exports = { cacheData, getCachedData, cacheMiddleware };