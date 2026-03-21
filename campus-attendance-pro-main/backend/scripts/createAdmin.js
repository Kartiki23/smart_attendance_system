const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import models
const User = require('../src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const createDefaultAdmin = async () => {
    try {
        console.log('🔍 Checking for existing admin...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@college.edu' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists!');
            console.log('   Email: admin@college.edu');
            console.log('   Password: Admin@123');
            process.exit(0);
        }

        console.log('📝 Creating default admin user...');

        // Create admin user
        const admin = await User.create({
            fullName: 'System Administrator',
            email: 'admin@college.edu',
            password: 'Admin@123',
            role: 'admin',
            avatar_url: ''
        });

        console.log('✅ Default admin user created successfully!');
        console.log('\n📋 Admin Credentials:');
        console.log('   Email: admin@college.edu');
        console.log('   Password: Admin@123');
        console.log('\n⚠️  Please change the password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createDefaultAdmin();
