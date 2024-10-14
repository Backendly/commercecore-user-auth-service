const request = require('supertest');
const express = require('express');
const prisma = require('../config/db'); // Adjust the path to your Prisma client instance
const organizationRoutes = require('../routes/organization'); // Adjust the path to your routes

const app = express();
app.use(express.json());
app.use('/api/v1/app', organizationRoutes);

jest.mock('../config/db', () => ({
  developers: {
    findUnique: jest.fn(),
  },
  organizations: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  developer_organizations: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}));

describe('Organization API Endpoints', () => {
  describe('POST /api/v1/app/create', () => {
    it('should create a new organization', async () => {
      const mockDeveloper = { id: 1, api_token: 'valid-token', is_active: true };
      const mockOrganization = { app: 'Test App', app_id: 1 };

      prisma.developers.findUnique.mockResolvedValue(mockDeveloper);
      prisma.organizations.create.mockResolvedValue(mockOrganization);
      prisma.developer_organizations.create.mockResolvedValue({});

      const response = await request(app)
        .post('/api/v1/app/create')
        .set('x-api-token', 'valid-token')
        .send({ app: 'Test App' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Organization created successfully');
      expect(response.body.organization).toHaveProperty('appId');
    });

    it('should return 400 if app name or API token is missing', async () => {
      const response = await request(app)
        .post('/api/v1/app/create')
        .send({ app: 'Test App' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('App name and API token are required');
    });

    it('should return 403 if developer token is invalid or inactive', async () => {
      prisma.developers.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/app/create')
        .set('x-api-token', 'invalid-token')
        .send({ app: 'Test App' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid or inactive developer token');
    });
  });

  describe('POST /api/v1/app/create-multiple', () => {
    it('should create multiple organizations', async () => {
      const mockDeveloper = { id: 1, api_token: 'valid-token', is_active: true };
      const mockOrganizations = [
        { app: 'Test App 1', app_id: 1 },
        { app: 'Test App 2', app_id: 2 },
      ];

      prisma.developers.findUnique.mockResolvedValue(mockDeveloper);
      prisma.$transaction.mockImplementation(async (callback) => {
        await callback({
          organizations: {
            create: jest.fn().mockResolvedValueOnce(mockOrganizations[0]).mockResolvedValueOnce(mockOrganizations[1]),
          },
          developer_organizations: {
            create: jest.fn(),
          },
        });
      });

      const response = await request(app)
        .post('/api/v1/app/create-multiple')
        .set('x-api-token', 'valid-token')
        .send({ apps: ['Test App 1', 'Test App 2'] });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('All organizations created successfully');
      expect(response.body.createdOrganizations).toHaveLength(2);
    });

    it('should return 400 if apps array or API token is missing', async () => {
      const response = await request(app)
        .post('/api/v1/app/create-multiple')
        .send({ apps: ['Test App 1', 'Test App 2'] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Array of app names and API token are required');
    });

    it('should return 403 if developer token is invalid or inactive', async () => {
      prisma.developers.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/app/create-multiple')
        .set('x-api-token', 'invalid-token')
        .send({ apps: ['Test App 1', 'Test App 2'] });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid or inactive developer token');
    });
  });

  describe('GET /api/v1/app/validate-app/:id', () => {
    it('should validate a valid organization ID', async () => {
      const mockDeveloper = { id: 1, api_token: 'valid-token', is_active: true };
      const mockOrganization = { app_id: 1 };

      prisma.developers.findUnique.mockResolvedValue(mockDeveloper);
      prisma.organizations.findUnique.mockResolvedValue(mockOrganization);

      const response = await request(app)
        .get('/api/v1/app/validate-app/1')
        .set('x-api-token', 'valid-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Valid organization ID');
    });

    it('should return 400 if organization ID or API token is missing', async () => {
      const response = await request(app)
        .get('/api/v1/app/validate-app/1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Organization ID and API token are required');
    });

    it('should return 403 if developer token is invalid or inactive', async () => {
      prisma.developers.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/app/validate-app/1')
        .set('x-api-token', 'invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid or inactive developer token');
    });

    it('should return 404 if organization is not found', async () => {
      const mockDeveloper = { id: 1, api_token: 'valid-token', is_active: true };

      prisma.developers.findUnique.mockResolvedValue(mockDeveloper);
      prisma.organizations.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/app/validate-app/1')
        .set('x-api-token', 'valid-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Organization not found');
    });
  });
});