// Run with: npm run seed
// Creates the admin account (Email: admin@gmail.com / Password: admin12345@)
// as specified. Safe to run multiple times — it won't duplicate the admin.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seed = async () => {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345@';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`Admin account already exists: ${adminEmail}`);
  } else {
    await User.create({
      role: 'admin',
      name: 'Swing Administrator',
      email: adminEmail,
      password: adminPassword, // hashed automatically via pre-save hook
      isVerified: true
    });
    console.log(`Admin account created: ${adminEmail}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
