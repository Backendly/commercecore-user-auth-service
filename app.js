require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const prisma = require('./config/db');  // Adjust the path to your db.js
const developerRoutes = require('./routes/developer');
const organizationRoutes = require('./routes/organization');

const app = express();
app.use(express.json());

// Log environment variables for debugging (optional)
console.log('Database URL:', process.env.DATABASE_URL);

// Set up routes
app.use('/api/developer', developerRoutes);
app.use('/api/organization', organizationRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
