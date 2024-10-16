// routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middlewares/profileMiddleware'); // Correct path to profileMiddleware

// Get profile
router.get('/', authenticate, profileController.getProfile);

// Update profile
router.put('/', authenticate, profileController.updateProfile);

// Delete profile
router.delete('/', authenticate, profileController.deleteProfile);

module.exports = router;