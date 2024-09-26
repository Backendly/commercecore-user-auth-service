const request = require('supertest');
const app = require('../app'); // Adjust the path to your app.js file

describe('App', () => {
  it('should return a welcome message at the root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Welcome to the Backendly E-commerce Authentication API');
    expect(response.body.version).toBe('V1');
  });

  it('should handle 404 errors for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Not Found');
  });

  // Add more tests for specific routes if needed
});