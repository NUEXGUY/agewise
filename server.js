require('dotenv').config({ path: './environment.env' });
console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);

const mysql = require('mysql2/promise');

async function checkDatabaseConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: true // This ensures that Node.js rejects unauthorized connections, for security
      }
    });

    // This is a simple query that doesn't depend on any table
    const [rows] = await connection.execute('SELECT 1;');
    console.log('Connection to the PlanetScale database successful:', rows);
    // Close the connection after the check
    await connection.end();
  } catch (error) {
    console.error('Unable to connect to the PlanetScale database:', error);
  }
}

// Call the function to test the connection
checkDatabaseConnection();
