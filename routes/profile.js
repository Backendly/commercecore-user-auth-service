const express = require('express');
const profileController = require('../controllers/profileController');
const authenticate = require('../middlewares/profileMiddleware'); // Correct path to middleware

const router = express.Router();

// Get profile
router.get('/', authenticate, profileController.getProfile);

// Create profile
router.post('/', authenticate, profileController.createProfile);

// Update profile
router.put('/', authenticate, profileController.updateProfile);

// Delete profile
router.delete('/', authenticate, profileController.deleteProfile);

module.exports = router;