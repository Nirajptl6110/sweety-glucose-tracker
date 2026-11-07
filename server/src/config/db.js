const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load server/.env when this module is used outside the normal server startup.
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const requiredVariables = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(`Missing database environment variables: ${missingVariables.join(', ')}`);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// The pool emits this event when an idle connection fails unexpectedly.
pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

async function testConnection() {
  try {
    const result = await pool.query(
      'SELECT NOW() AS current_time, current_database() AS database_name'
    );

    return result.rows[0];
  } catch (error) {
    console.error('Could not connect to PostgreSQL:', error.message);
    throw error;
  }
}

module.exports = { pool, testConnection };
