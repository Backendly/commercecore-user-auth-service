require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const prisma = require('./config/db');  // Adjust the path to your db.js

const app = express();
app.use(express.json());

// Log environment variables for debugging (optional)
console.log('Database URL:', process.env.DATABASE_URL);

// Other app setup here, like routes, middleware, etc.

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
