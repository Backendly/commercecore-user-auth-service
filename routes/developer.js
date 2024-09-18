const express = require('express');
const pool = require('../config/db'); // Ensure this path is correct
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt'); // For password hashing
const router = express.Router();

// Endpoint to register a developer and generate UUID token
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    // Hash the password before saving it
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate a unique UUID token for the developer
    const apiToken = uuidv4();

    // Insert the developer into the database
    const result = await pool.query(
      `INSERT INTO developers (name, email, password_hash, api_token, is_active) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, email, passwordHash, apiToken, true]
    );

    const { id } = result.rows[0];

    res.status(201).json({
      message: 'Developer registered successfully',
      developer: {
        id,
      },
    });
  } catch (error) {
    console.error('Error registering developer:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// Endpoint to retrieve the developer's API token (login)
router.post('/retrieve-token', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Retrieve the developer's details from the database
    const result = await pool.query(
      `SELECT id, password_hash, api_token FROM developers WHERE email = $1 AND is_active = $2`,
      [email, true]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Developer not found or inactive' });
    }

    const developer = result.rows[0];

    // Compare the provided password with the stored password hash
    const isPasswordValid = await bcrypt.compare(password, developer.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Return the developer's ID and API token
    res.status(200).json({
      message: 'Token retrieved successfully',
      developer: {
        id: developer.id,
        api_token: developer.api_token,
      },
    });
  } catch (error) {
    console.error('Error retrieving token:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
