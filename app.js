require('dotenv').config();
const express = require('express');
const setupMiddlewares = require('./middlewares');
const routes = require('./routes');
const rootRoute = require('./routes/root');
const prisma = require('./config/db'); // Adjust the path to your Prisma client instance
const developerScheduler = require('./utils/developerScheduler'); // Import the developer scheduler
const userScheduler = require('./utils/userScheduler'); // Import the user scheduler

const app = express();

// Setup middlewares
setupMiddlewares(app);

// Root endpoint
app.use('/', rootRoute);

// Set up routes
app.use('/api/v1', routes);

// Start the schedulers
developerScheduler;
userScheduler;

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;