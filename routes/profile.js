// routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate, checkRolePermission } = require('../middlewares/profileMiddleware'); // Correct path to profileMiddleware

// Get profile
router.get('/', authenticate, checkRolePermission('user', 'view_profile'), profileController.getProfile);
router.get('/', authenticate, checkRolePermission('developer', 'view_profile'), profileController.getProfile);

// Update profile
router.put('/', authenticate, checkRolePermission('user', 'edit_profile'), profileController.updateProfile);
router.put('/', authenticate, checkRolePermission('developer', 'edit_profile'), profileController.updateProfile);

// Delete profile
router.delete('/', authenticate, checkRolePermission('user', 'delete_profile'), profileController.deleteProfile);
router.delete('/', authenticate, checkRolePermission('developer', 'delete_profile'), profileController.deleteProfile);

module.exports = router;