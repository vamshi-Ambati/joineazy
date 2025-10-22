const { Pool } = require('pg');

// Using Pool is preferred for connection management
const pool = new Pool({
  user: 'vamshiambati',
  host: 'localhost',
  database: 'joineazy',
  password: 'my_password',
  port: 5432,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL!');
  release(); // release the client back to the pool
});

module.exports = pool;
