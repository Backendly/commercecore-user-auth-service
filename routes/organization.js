// routes/organization.js
const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// Create a single organization
router.post('/create', organizationController.createOrganization);

// Create multiple organizations
router.post('/create-multiple', organizationController.createMultipleOrganizations);

// Validate organization ID
router.get('/validate-app/:id', organizationController.validateOrganizationId);

module.exports = router;
