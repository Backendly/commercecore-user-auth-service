// routes/index.js
const express = require('express');
const developerRoutes = require('./developer');
const organizationRoutes = require('./organization');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const userRoutes = require('./user'); // Add user routes

const router = express.Router();

router.use('/developer', developerRoutes);
router.use('/app', organizationRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/user', userRoutes); // Use user routes

module.exports = router;