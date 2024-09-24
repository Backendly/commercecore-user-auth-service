const express = require('express');
const { signup, login, logout, requestPasswordReset, resetPassword } = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/signup', signup); // No need for authenticateToken middleware here
router.post('/login', login);
router.post('/logout', authenticateToken, logout); // Apply authenticateToken middleware
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;