const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Validate User ID
router.get('/validate-user/:userId', authController.validateUserId);

module.exports = router;