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
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/email-confirmation', emailConfirmation);
router.post('/login-validation', loginValidation);
router.post('/regenerate-otp', regenerateOTP);
router.post('/regenerate-email-verification-otp', regenerateEmailVerificationOTP);
router.get('/validate-user/:userId', validateUserId);

module.exports = router;