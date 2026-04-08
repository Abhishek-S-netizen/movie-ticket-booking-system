const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const createAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin already exists. Skipping creation.');
            process.exit();
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin created successfully!');
        console.log('Use /api/auth/login with this admin to get your JWT.');
        console.log('Email:', admin.email);
        console.log('Password: admin123');
        process.exit();
    } catch (err) {
        console.error('❌ Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();