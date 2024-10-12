// routes/developer.js
const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');

// Register a developer
router.post('/register', developerController.registerDeveloper);

// Retrieve API token
router.post('/retrieve-token', developerController.retrieveToken);

// Validate developer's API token
router.get('/validate-token', developerController.validateToken);

module.exports = router;