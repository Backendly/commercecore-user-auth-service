const express = require('express');
const { createRole, assignRoleToUser, getRoles } = require('../controllers/rolesController');
const authenticateToken = require('../middlewares/authMiddleware'); // Middleware for authentication

const router = express.Router();

router.post('/create', authenticateToken, createRole); // Create a new role
router.post('/assign', authenticateToken, assignRoleToUser); // Assign role to user
router.get('/', authenticateToken, getRoles); // Get all roles

module.exports = router;

