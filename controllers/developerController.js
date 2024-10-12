const prisma = require('../config/db'); // Use Prisma client instance
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { assignRoleToDeveloper } = require('../utils/roleUtils'); // Import the role assignment function

// Register a developer
exports.registerDeveloper = async (req, res) => {
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
        password_hash: passwordHash,
        api_token: apiToken,
        is_active: true,
      },
    });

    // Create a developer profile
    await prisma.developer_profiles.create({
      data: {
        developer_id: developer.id,
        name,
        phone_number: '', // Add default or required fields
        address: '', // Add default or required fields
        profile_picture_url: '', // Add default or required fields
      },
    });

    // Assign the 'developer' role to the new developer
    await assignRoleToDeveloper(developer.id, null, 'developer'); // Pass null for appId

    res.status(201).json({
      message: 'Developer registered successfully',
      developer: { id: developer.id },
    });
  } catch (error) {
    console.error('Error registering developer:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Retrieve API token
exports.retrieveToken = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const developer = await prisma.developers.findUnique({
      where: { email, is_active: true },
    });

    if (!developer) {
      return res.status(404).json({ error: 'Developer not found or inactive' });
    }

    const isPasswordValid = await bcrypt.compare(password, developer.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Token retrieved successfully',
      developer: { id: developer.id, api_token: developer.api_token },
    });
  } catch (error) {
    console.error('Error retrieving token:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Validate developer's API token
exports.validateToken = async (req, res) => {
  const apiToken = req.headers['x-api-token']; // API token provided in headers

  if (!apiToken) {
    return res.status(400).json({ error: 'API token is required' });
  }

  try {
    // Fetch developer by API token
    const developer = await prisma.developers.findUnique({
      where: { api_token: apiToken, is_active: true },
    });

    if (!developer) {
      return res.status(403).json({ error: 'Invalid or inactive developer token' });
    }

    res.status(200).json({
      message: 'Valid API token',
      developer: { id: developer.id } // Return developer's ID
    });
  } catch (error) {
    console.error('Error validating API token:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};