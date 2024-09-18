const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const checkUser = require('../middlewares/checkUser'); // Import the middleware
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName, organizationId } = req.body;
  
  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    // Check if the organization exists
    const orgResult = await pool.query(
      'SELECT * FROM organizations WHERE app_id = $1',
      [organizationId]
    );
    if (orgResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid organization ID' });
    }

    // Insert user into the users table, with organization_id (app_id)
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email',
      [email, hashedPassword, firstName, lastName, organizationId]
    );
    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    res.json({ token });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Signin Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected Route (example)
router.get('/whoami', checkUser, async (req, res) => {
  try {
    const user = req.authData.user;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;