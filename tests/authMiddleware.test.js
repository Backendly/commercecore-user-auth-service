const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Adjust the path to your
                                                                        // middleware

jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());

app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Access granted', user: req.user });
});

describe('authenticateToken Middleware', () => {
  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/protected');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should return 403 if token is invalid or expired', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  it('should call next and attach user to req if token is valid', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    jwt.verify.mockReturnValue(mockUser);

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer validtoken');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
    expect(response.body.user).toEqual(mockUser);
  });
});