const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Middleware to check user authentication
const checkUser = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.replace(/^Bearer /, '');

  console.log('Received Token:', token);

  if (token) {
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded Token:', decoded);

      // Query the user based on the user ID in the token
      const userResult = await pool.query('SELECT id, first_name, last_name, email FROM users WHERE id = $1', [decoded.userId]);
      const user = userResult.rows[0];

      if (user) {
        // Check if the token is valid
        const tokenResult = await pool.query('SELECT * FROM tokens WHERE user_id = $1 AND token = $2', [user.id, token]);
        const authToken = tokenResult.rows[0];

        if (authToken) {
          req.authData = { user, token };

          // Update the lastUsedAt field for the token
          await pool.query('UPDATE tokens SET last_used_at = $1 WHERE id = $2', [new Date(), authToken.id]);

          // Continue to the next middleware or route handler
          return next();
        } else {
          throw new Error('Invalid token');
        }
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({
        ok: false,
        error: {
          type: 'simple',
          message: 'Unauthorized',
          id: 'unauthorized',
        },
      });
    }
  } else {
    return res.status(401).json({
      ok: false,
      error: {
        type: 'simple',
        message: 'Token missing',
        id: 'unauthorized',
      },
    });
  }
};

module.exports = checkUser;