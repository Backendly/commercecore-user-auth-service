// routes/auth.js
const express = require('express');
const {
  signup,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  emailConfirmation,
  loginValidation,
  regenerateOTP,
  regenerateEmailVerificationOTP,
  validateUserId
} = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { cacheMiddleware } = require('../middlewares/cache'); // Correct path
const router = express.Router();

router.post('/signup', signup); // No caching for signup
router.post('/login', cacheMiddleware, login);
router.post('/logout', authenticateToken, logout);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/email-confirmation', cacheMiddleware, emailConfirmation);
router.post('/login-validation', cacheMiddleware, loginValidation);
router.post('/regenerate-otp', regenerateOTP);
router.post('/regenerate-email-verification-otp', regenerateEmailVerificationOTP);


module.exports = router;