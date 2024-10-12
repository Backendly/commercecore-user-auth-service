// routes/index.js
const express = require('express');
const developerRoutes = require('./developer');
const organizationRoutes = require('./organization');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const publishRoutes = require('./publish'); // Add this line if you have a publish route

const router = express.Router();

router.use('/developer', developerRoutes);
router.use('/app', organizationRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/publish', publishRoutes); // Add this line if you have a publish route

module.exports = router;