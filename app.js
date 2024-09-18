const express = require('express');
const bodyParser = require('body-parser');
const developerRoutes = require('./routes/developer');
const organizationRoutes = require('./routes/organization');
const userRoutes = require('./routes/users'); // Import the users routes

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Use the developer, organization, and user routes with unique prefixes
app.use('/api/developers', developerRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes); // Use the users routes

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
