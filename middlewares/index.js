// middlewares/index.js
const express = require('express');
const redisClientMiddleware = require('./redisClientMiddleware');
const errorHandler = require('./errorMiddleware');

const setupMiddlewares = (app) => {
  app.use(express.json());
  app.use(redisClientMiddleware);
  app.use(errorHandler);
};

module.exports = setupMiddlewares;