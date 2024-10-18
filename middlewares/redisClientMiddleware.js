// redisClientMiddleware.js
const { client1, client2 } = require('../config/redis');

const redisClientMiddleware = (req, res, next) => {
    req.redisClient1 = client1; // Remote Redis
    req.redisClient2 = client2; // Local Redis
    next();
};

module.exports = redisClientMiddleware;
