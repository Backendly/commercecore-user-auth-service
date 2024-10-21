const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');
const { cacheMiddleware } = require('../middlewares/cache'); // Adjust the path as needed

// Attach cache middleware to all routes
router.use(cacheMiddleware);

// Register a developer
router.post('/register', developerController.registerDeveloper);

// Email Confirmation
router.post('/email-confirmation', developerController.emailConfirmation);

// Retrieve API token
router.post('/retrieve-token', developerController.retrieveToken);

// Regenerate API token
router.post('/regenerate-token', developerController.regenerateToken);

// Reset Password
router.post('/reset-password', developerController.resetPassword);

// Validate developer's API token
router.get('/validate-token', developerController.validateToken);

module.exports = router;