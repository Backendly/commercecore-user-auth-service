const express = require('express');
const pool = require('../config/db'); // Ensure this path matches the actual location of your db configuration
const router = express.Router();

// Endpoint to create a single organization
router.post('/create', async (req, res) => {
  const { app } = req.body; // Single app name provided by the developer
  const apiToken = req.headers['x-api-token']; // API token provided in headers

  if (!app || !apiToken) {
    return res.status(400).json({ error: 'App name and API token are required' });
  }

  try {
    // Fetch developer by API token
    const devResult = await pool.query(
      `SELECT id FROM developers WHERE api_token = $1 AND is_active = true`,
      [apiToken]
    );

    if (devResult.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid or inactive developer token' });
    }

    const developerId = devResult.rows[0].id;

    // Insert new organization
    const orgResult = await pool.query(
      `INSERT INTO organizations (app) VALUES ($1) RETURNING app_id`,
      [app]
    );

    const appId = orgResult.rows[0].app_id;

    // Link developer to the new organization
    await pool.query(
      `INSERT INTO developer_organizations (developer_id, app_id, role) VALUES ($1, $2, $3)`,
      [developerId, appId, 'owner']
    );

    res.status(201).json({
      message: 'Organization created successfully',
      organization: { app, appId },
    });
  } catch (error) {
    console.error('Error creating organization:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to create multiple organizations
router.post('/create-multiple', async (req, res) => {
  const { apps } = req.body; // Array of app names provided by the developer
  const apiToken = req.headers['x-api-token']; // API token provided in headers

  if (!apps || !Array.isArray(apps) || apps.length === 0 || !apiToken) {
    return res.status(400).json({ error: 'Array of app names and API token are required' });
  }

  try {
    // Fetch developer by API token
    const devResult = await pool.query(
      `SELECT id FROM developers WHERE api_token = $1 AND is_active = true`,
      [apiToken]
    );

    if (devResult.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid or inactive developer token' });
    }

    const developerId = devResult.rows[0].id;

    const createdOrganizations = [];
    const errors = [];

    // Start a transaction to handle batch creation
    await pool.query('BEGIN');

    for (const app of apps) {
      try {
        // Insert new organization
        const orgResult = await pool.query(
          `INSERT INTO organizations (app) VALUES ($1) RETURNING app_id`,
          [app]
        );

        const appId = orgResult.rows[0].app_id;

        // Link developer to the new organization
        await pool.query(
          `INSERT INTO developer_organizations (developer_id, app_id, role) VALUES ($1, $2, $3)`,
          [developerId, appId, 'owner']
        );

        // Add successfully created organization to the list
        createdOrganizations.push({ app, appId });
      } catch (insertError) {
        // If there's an error, add it to the errors array
        errors.push({
          app,
          error: insertError.code === '23505' 
            ? 'Organization name already exists' 
            : insertError.message
        });
      }
    }

    // Commit the transaction if no errors occurred
    if (errors.length === 0) {
      await pool.query('COMMIT');
    } else {
      // Rollback in case of errors
      await pool.query('ROLLBACK');
    }

    // Provide feedback on the created organizations and errors
    res.status(201).json({
      message: 'Batch organization creation completed',
      createdOrganizations,
      errors,
    });
  } catch (error) {
    // Rollback in case of an overall failure
    await pool.query('ROLLBACK');
    console.error('Error creating organizations:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to validate organization ID
router.get('/validate-app/:id', async (req, res) => {
  const { id } = req.params; // Organization ID provided in URL parameters

  if (!id) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }

  try {
    // Fetch organization by ID
    const result = await pool.query(
      `SELECT app_id FROM organizations WHERE app_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.status(200).json({ message: 'Valid organization ID' });
  } catch (error) {
    console.error('Error validating organization ID:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;