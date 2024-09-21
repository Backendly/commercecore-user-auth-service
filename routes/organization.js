const express = require('express');
const prisma = require('../config/db'); // Use Prisma client instance
const router = express.Router();

// Create a single organization
router.post('/create', async (req, res) => {
  const { app } = req.body;
  const apiToken = req.headers['x-api-token'];

  if (!app || !apiToken) {
    return res.status(400).json({ error: 'App name and API token are required' });
  }

  try {
    const developer = await prisma.developer.findUnique({
      where: { apiToken, isActive: true },
    });

    if (!developer) {
      return res.status(403).json({ error: 'Invalid or inactive developer token' });
    }

    const organization = await prisma.organization.create({
      data: { app },
    });

    await prisma.developerOrganization.create({
      data: {
        developerId: developer.id,
        appId: organization.appId,
        role: 'owner',
      },
    });

    res.status(201).json({
      message: 'Organization created successfully',
      organization: { app, appId: organization.appId },
    });
  } catch (error) {
    console.error('Error creating organization:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
