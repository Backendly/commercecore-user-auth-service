require('dotenv').config();
const express = require('express');
const prisma = require('./config/db');   // Adjust the path to your Prisma client instance
const developerRoutes = require('./routes/developer');
const organizationRoutes = require('./routes/organization');
const authRoutes = require('./routes/auth'); // New
const profileRoutes = require('./routes/profile'); // New
const roleRoutes = require('./routes/roles'); // New
const errorHandler = require('./middlewares/errorMiddleware');
const userRoutes = require('./routes/user');

const app = express();
app.use(express.json());
app.use(errorHandler);

// Log environment variables for debugging (optional)
console.log('Database URL:', process.env.DATABASE_URL);

// Set up routes
app.use('/api/v1/developer', developerRoutes);
app.use('/api/v1/app', organizationRoutes);
app.use('/api/v1/auth', authRoutes);  // Authentication routes
app.use('/api/v1/profile', profileRoutes);  // User profile routes
app.use('/api/v1/roles', roleRoutes);  // Role management routes
app.use('/api/v1/user', userRoutes);

// Root endpoint with introduction and list of endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Backendly E-commerce Authentication API',
    version: 'V1',
    documentation: 'https://your-documentation-link.com',
    deployment: 'https://your-deployment-link.com',
    endpoints: {
      developer: {
        register: {
          method: 'POST',
          url: '/api/vi/developer/register',
          description: 'Registers a new developer'
        },
        retrieveToken: {
          method: 'POST',
          url: '/api/v1/developer/retrieve-token',
          description: 'Retrieves the API token for a developer'
        },
        validateToken: {
          method: 'GET',
          url: '/api/v1/developer/validate-token',
          description: 'Validates the developer\'s API token'
        }
      },
      organization: {
        create: {
          method: 'POST',
          url: '/api/v1/app/create',
          description: 'Creates a new organization (app)'
        },
        createMultiple: {
          method: 'POST',
          url: '/api/v1/app/create-multiple',
          description: 'Creates multiple organizations (apps)'
        },
        validateApp: {
          method: 'GET',
          url: '/api/v1/app/validate-app/:id',
          description: 'Validates the organization ID'
        }
      },
      auth: {
        signup: {
          method: 'POST',
          url: '/api/v1/auth/signup',
          description: 'Registers a new user'
        },
        login: {
          method: 'POST',
          url: '/api/v1/auth/login',
          description: 'Logs in a user'
        },
        logout: {
          method: 'POST',
          url: '/api/v1/auth/logout',
          description: 'Logs out a user'
        },
        requestPasswordReset: {
          method: 'POST',
          url: '/api/v1/auth/request-password-reset',
          description: 'Requests a password reset'
        },
        resetPassword: {
          method: 'POST',
          url: '/api/v1/auth/reset-password',
          description: 'Resets the user\'s password'
        }
      },
      user: {
        validateUserId: {
          method: 'GET',
          url: '/api/v1/user/validate-user/:userId',
          description: 'Validates the user ID'
        }
      }
    }
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;