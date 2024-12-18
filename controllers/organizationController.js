const prisma = require('../config/db'); // Use Prisma client instance
const { cacheData, getCachedData } = require('../middlewares/cache'); // Import caching functions

// Create a single organization
exports.createOrganization = async (req, res) => {
  const { app } = req.body;
  const apiToken = req.headers['x-api-token'];

  if (!app || !apiToken) {
    return res.status(400).json({ error: 'App name and API token are required' });
  }

  try {
    // Check if developer data is cached
    let developer = await getCachedData(`developer:${apiToken}`);
    if (!developer) {
      developer = await prisma.developers.findUnique({
        where: { api_token: apiToken, is_active: true },
      });

      if (!developer) {
        return res.status(403).json({ error: 'Invalid or inactive developer token' });
      }

      // Cache developer data
      await cacheData(`developer:${apiToken}`, developer);
    }

    // Create a new organization and link it to the developer
    const organization = await prisma.organizations.create({
      data: { app },
    });

    // Link developer to the organization in the `developer_organizations` table
    await prisma.developer_organizations.create({
      data: {
        developer_id: developer.id,
        app_id: organization.app_id,
        role: 'owner', // Assign role as 'owner'
      },
    });

    res.status(201).json({
      message: 'Organization created successfully',
      organization: { app, appId: organization.app_id },
    });
  } catch (error) {
    if (error.code === 'P2002') { // Prisma's unique constraint violation error
      return res.status(409).json({ error: 'Organization name already exists' });
    }
    console.error('Error creating organization:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create multiple organizations
exports.createMultipleOrganizations = async (req, res) => {
  const { apps } = req.body; // Array of app names
  const apiToken = req.headers['x-api-token'];

  if (!apps || !Array.isArray(apps) || apps.length === 0 || !apiToken) {
    return res.status(400).json({ error: 'Array of app names and API token are required' });
  }

  try {
    // Check if developer data is cached
    let developer = await getCachedData(`developer:${apiToken}`);
    if (!developer) {
      developer = await prisma.developers.findUnique({
        where: { api_token: apiToken, is_active: true },
      });

      if (!developer) {
        return res.status(403).json({ error: 'Invalid or inactive developer token' });
      }

      // Cache developer data
      await cacheData(`developer:${apiToken}`, developer);
    }

    const createdOrganizations = [];
    const errors = [];

    // Start a transaction for batch creation
    const transaction = await prisma.$transaction(async (tx) => {
      for (const app of apps) {
        try {
          // Create the organization
          const organization = await tx.organizations.create({
            data: { app },
          });

          // Link the developer to the newly created organization
          await tx.developer_organizations.create({
            data: {
              developer_id: developer.id,
              app_id: organization.app_id,
              role: 'owner',
            },
          });

          // Add successfully created organization to the list
          createdOrganizations.push({ app, appId: organization.app_id });
        } catch (insertError) {
          // Handle unique constraint violation and other errors
          errors.push({
            app,
            error: insertError.code === 'P2002'
              ? 'Organization name already exists'
              : insertError.message,
          });
        }
      }
    });

    // Check if there were any errors in the batch
    if (errors.length > 0) {
      res.status(207).json({
        message: 'Batch organization creation completed with some errors',
        createdOrganizations,
        errors,
      });
    } else {
      res.status(201).json({
        message: 'All organizations created successfully',
        createdOrganizations,
      });
    }
  } catch (error) {
    console.error('Error creating organizations:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};


// Validate organization ID
exports.validateOrganizationId = async (req, res) => {
  const { id } = req.params; // Organization ID
  const apiToken = req.headers['x-api-token'];

  if (!id || !apiToken) {
    return res.status(400).json({ error: 'Organization ID and API token are required' });
  }

  try {
    // Check if developer data is cached
    let developer = await getCachedData(`developer:${apiToken}`);
    if (!developer) {
      developer = await prisma.developers.findUnique({
        where: { api_token: apiToken, is_active: true },
      });

      if (!developer) {
        return res.status(403).json({ error: 'Invalid or inactive developer token' });
      }

      // Cache developer data
      await cacheData(`developer:${apiToken}`, developer);
    }

    console.log('Developer:', JSON.stringify(developer, null, 2));

    // Check if organization data is cached
    let organization = await getCachedData(`organization:${id}`);
    if (!organization) {
      organization = await prisma.organizations.findUnique({
        where: { app_id: id },
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Cache organization data
      await cacheData(`organization:${id}`, organization);
    }

    console.log('Organization:', JSON.stringify(organization, null, 2));

    res.status(200).json({ message: 'Valid organization ID' });
  } catch (error) {
    console.error('Error validating organization ID:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};