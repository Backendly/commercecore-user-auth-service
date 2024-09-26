const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/db'); // Adjust the path to your Prisma client instance
const developerRoutes = require('../routes/developer'); // Adjust the path to your routes

const app = express();
app.use(express.json());
app.use('/api/v1/developer', developerRoutes);

jest.mock('../config/db', () => ({
  developers: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe('Developer API Endpoints', () => {
  describe('POST /api/v1/developer/register', () => {
    it('should register a new developer', async () => {
      const mockDeveloper = {
        id: 1,
        name: 'Test Developer',
        email: 'test@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        api_token: uuidv4(),
        is_active: true,
      };

      prisma.developers.create.mockResolvedValue(mockDeveloper);

      const response = await request(app)
        .post('/api/v1/developer/register')
        .send({
          name: 'Test Developer',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Developer registered successfully');
      expect(response.body.developer).toHaveProperty('id');
    });

    it('should return 400 if name, email, or password is missing', async () => {
      const response = await request(app)
        .post('/api/v1/developer/register')
        .send({
          name: 'Test Developer',
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name, email, and password are required');
    });
  });

  describe('POST /api/v1/developer/retrieve-token', () => {
    it('should retrieve API token for a valid developer', async () => {
      const mockDeveloper = {
        id: 1,
        email: 'test@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        api_token: uuidv4(),
        is_active: true,
      };

      prisma.developers.findUnique.mockResolvedValue(mockDeveloper);

      const response = await request(app)
        .post('/api/v1/developer/retrieve-token')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Token retrieved successfully');
      expect(response.body.developer).toHaveProperty('api_token');
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/v1/developer/retrieve-token')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('should return 404 if developer is not found or inactive', async () => {
      prisma.developers.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/developer/retrieve-token')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Developer not found or inactive');
    });

    it('should return 401 if password is invalid', async () => {
      const mockDeveloper = {
        id: 1,
        email: 'test@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        api_token: uuidv4(),
        is_active: true,
      };

      prisma.developers.findUnique.mockResolvedValue(mockDeveloper);

      const response = await request(app)
        .post('/api/v1/developer/retrieve-token')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid password');
    });
  });

  describe('GET /api/v1/developer/validate-token', () => {
    it('should validate a valid API token', async () => {
      const mockDeveloper = {
        id: 1,
        api_token: uuidv4(),
        is_active: true,
      };

      prisma.developers.findUnique.mockResolvedValue(mockDeveloper);

      const response = await request(app)
        .get('/api/v1/developer/validate-token')
        .set('x-api-token', mockDeveloper.api_token);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Valid API token');
      expect(response.body.developer).toHaveProperty('id');
    });

    it('should return 400 if API token is missing', async () => {
      const response = await request(app)
        .get('/api/v1/developer/validate-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('API token is required');
    });

    it('should return 403 if API token is invalid or inactive', async () => {
      prisma.developers.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/developer/validate-token')
        .set('x-api-token', 'invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid or inactive developer token');
    });
  });
});