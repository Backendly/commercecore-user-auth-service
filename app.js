require("dotenv").config();
const express = require("express");
const setupMiddlewares = require("./middlewares");
const routes = require("./routes");
const rootRoute = require("./routes/root");
const developerScheduler = require("./utils/developerScheduler"); // Import the developer scheduler
const userScheduler = require("./utils/userScheduler"); // Import the user scheduler

const app = express();

// enable CORS
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With",
    "X-Api-Key", "X-App-Id", "X-User-Id"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);

  const originalSend = res.send;
  res.send = function (body) {
    console.log(`${res.statusCode}: ${body}`);
    return originalSend.call(this, body);
  };

  next();
});

// Setup middlewares
setupMiddlewares(app);

// Root endpoint
app.use("/", rootRoute);

// Set up routes
app.use("/api/v1", routes);

// Start the schedulers
developerScheduler;
userScheduler;

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
