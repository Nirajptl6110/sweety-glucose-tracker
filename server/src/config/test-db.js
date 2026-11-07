const { pool, testConnection } = require('./db');

async function runDatabaseTest() {
  try {
    const result = await testConnection();
    console.log('PostgreSQL connection successful:');
    console.log(`Database: ${result.database_name}`);
    console.log(`Database time: ${result.current_time.toISOString()}`);
  } catch (error) {
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runDatabaseTest();
