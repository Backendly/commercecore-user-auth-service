const express = require('express');
const request = require('supertest');
const errorHandler = require('../middlewares/errorMiddleware'); // Adjust the path to your middleware

const app = express();
app.use(express.json());

// A sample route to trigger an error
app.get('/error', (req, res, next) => {
  const error = new Error('Test error');
  next(error);
});

// Use the error handler middleware
app.use(errorHandler);

describe('Error Handler Middleware', () => {
  it('should handle an error and return a 500 status code', async () => {
    const response = await request(app).get('/error');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('An error occurred');
    expect(response.body.error).toBe('Test error');
  });

  it('should log the error stack to the console', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await request(app).get('/error');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Test error'));
    consoleSpy.mockRestore();
  });
});