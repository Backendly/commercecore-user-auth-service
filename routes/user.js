// routes/user.js
const express = require('express');
const { validateUserId } = require('../controllers/authController');
const { cacheMiddleware } = require('../middlewares/cache');

const router = express.Router();

router.get('/validate-user/:userId', cacheMiddleware, validateUserId);

module.exports = router;