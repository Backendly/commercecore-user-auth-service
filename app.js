const express = require('express');
const bodyParser = require('body-parser');
const developerRoutes = require('./routes/developer'); // Ensure this path is correct
const organizationRoutes = require('./routes/organization'); // Ensure this path is correct

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Use the developer and organization routes
app.use('/api', developerRoutes);
app.use('/api', organizationRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});