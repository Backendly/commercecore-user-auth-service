// middlewares/redisClientMiddleware.js
const redisClient = require('../config/redis');

const redisClientMiddleware = (req, res, next) => {
    req.redisClient = redisClient;
    next();
};

module.exports = redisClientMiddleware;