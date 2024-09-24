const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const authenticateToken = require('../middlewares/authMiddleware');


const router = express.Router();

router.get('/', authenticateToken, getProfile); // Get user's profile
router.put('/', authenticateToken, updateProfile); // Update user's profile

module.exports = router;
