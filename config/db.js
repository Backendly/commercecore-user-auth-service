require('dotenv').config(); // Load environment variables from .env file
const { Pool } = require('pg');

// Create a new pool instance with your PostgreSQL credentials
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Database connected successfully');
  release();
});

// Export the pool to use it in other parts of your application
module.exports = pool;