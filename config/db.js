require('dotenv').config(); // Load environment variables from .env file
const { Pool } = require('pg');

// Ensure the environment variable is loaded
console.log('Database URL:', process.env.DATABASE_URL); // Should log the URL

// Create a new pool instance with your PostgreSQL credentials
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  
  ssl: {
    rejectUnauthorized: false,  // Important for external connections
  },
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
