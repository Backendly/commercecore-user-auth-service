const express = require('express');
const prisma = require('../config/db'); // Use Prisma client instance
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const router = express.Router();

// Register a developer
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const apiToken = uuidv4();

    const developer = await prisma.developers.create({
      data: {
        name,
        email,
        password_hash: passwordHash, // Correct field name
        api_token: apiToken, // Correct field name
        is_active: true, // Correct field name
      },
    });

    res.status(201).json({
      message: 'Developer registered successfully',
      developer: { id: developer.id },
    });
  } catch (error) {
    console.error('Error registering developer:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Retrieve API token
router.post('/retrieve-token', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const developer = await prisma.developers.findUnique({
      where: { email, is_active: true }, // Correct field name
    });

    if (!developer) {
      return res.status(404).json({ error: 'Developer not found or inactive' });
    }

    const isPasswordValid = await bcrypt.compare(password, developer.password_hash); // Correct field name

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Token retrieved successfully',
      developer: { id: developer.id, api_token: developer.api_token }, // Correct field name
    });
  } catch (error) {
    console.error('Error retrieving token:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
