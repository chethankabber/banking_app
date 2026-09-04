// Run with: npm run seed
// Creates a default admin account for demo/testing purposes.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  await connectDB();

  const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
  if (existingAdmin) {
    console.log('Demo admin already exists.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  await Admin.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
  });

  console.log('Demo admin created: admin@example.com / Admin@123');
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
