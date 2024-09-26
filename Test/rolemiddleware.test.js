const express = require('express');
const request = require('supertest');
const prisma = require('../config/db'); // Adjust the path to your Prisma client instance
const { authorizeRole } = require('../middlewares/roleMiddleware'); // Adjust the path to your middleware

jest.mock('../config/db', () => ({
  user_roles: {
    findMany: jest.fn(),
  },
}));

const app = express();
app.use(express.json());

// Mock user data middleware
app.use((req, res, next) => {
  req.user = { userId: 1 }; // Mock user ID
  next();
});

// Protected route
app.get('/protected', authorizeRole('Admin'), (req, res) => {
  res.status(200).json({ message: 'Access granted' });
});

describe('authorizeRole Middleware', () => {
  it('should grant access if user has the required role', async () => {
    const mockUserRoles = [
      { roles: { name: 'Admin' } },
      { roles: { name: 'User' } },
    ];

    prisma.user_roles.findMany.mockResolvedValue(mockUserRoles);

    const response = await request(app).get('/protected');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
  });

  it('should deny access if user does not have the required role', async () => {
    const mockUserRoles = [
      { roles: { name: 'User' } },
    ];

    prisma.user_roles.findMany.mockResolvedValue(mockUserRoles);

    const response = await request(app).get('/protected');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Access denied: Insufficient role');
  });

  it('should handle server errors', async () => {
    const error = new Error('Server error');
    prisma.user_roles.findMany.mockRejectedValue(error);

    const response = await request(app).get('/protected');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');
  });
});