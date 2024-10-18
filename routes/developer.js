// routes/developer.js
const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');
const { cacheMiddleware } = require('../middlewares/cache'); // Adjust the path as needed

// Register a developer
router.post('/register', developerController.registerDeveloper);

// Retrieve API token
router.post('/retrieve-token', cacheMiddleware, developerController.retrieveToken);

// Validate developer's API token
router.get('/validate-token', cacheMiddleware, developerController.validateToken);

module.exports = router;