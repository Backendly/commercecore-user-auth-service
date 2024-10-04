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
  regenerateEmailVerificationOTP 
} = require('../controllers/authController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/signup', signup); // No need for authenticateToken middleware here
router.post('/login', login);
router.post('/logout', authenticateToken, logout); // Apply authenticateToken middleware
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/email-confirmation', emailConfirmation);
router.post('/login-validation', loginValidation);
router.post('/regenerate-otp', regenerateOTP);
router.post('/regenerate-email-verification-otp', regenerateEmailVerificationOTP);

module.exports = router;