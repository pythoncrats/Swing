const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'swing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: false
});

const connectDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log(`MySQL connected: ${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'swing'}`);
    conn.release();
  } catch (err) {
    console.error(`MySQL connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
