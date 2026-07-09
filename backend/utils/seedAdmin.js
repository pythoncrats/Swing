// Run with: npm run seed
// Creates the admin account (Email: admin@gmail.com / Password: admin12345@)
// as specified. Safe to run multiple times — it won't duplicate the admin.
// NOTE: Make sure you've already run sql/schema.sql to create the tables
// before running this script.
require('dotenv').config();
const { pool, connectDB } = require('../config/db');
const { createUser, findUserByEmail } = require('../models/User');

const seed = async () => {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345@';

  const existing = await findUserByEmail(adminEmail);
  if (existing) {
    console.log(`Admin account already exists: ${adminEmail}`);
  } else {
    await createUser({
      role: 'admin',
      name: 'Swing Administrator',
      email: adminEmail,
      password: adminPassword, // hashed inside createUser
      isVerified: true
    });
    console.log(`Admin account created: ${adminEmail}`);
  }

  await pool.end();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
