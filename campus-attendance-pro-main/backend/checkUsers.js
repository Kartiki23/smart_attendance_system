const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const User = require('./src/models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB\n');

        const users = await User.find({});

        console.log(`Total users in database: ${users.length}\n`);

        if (users.length === 0) {
            console.log('❌ No users found in database!\n');
        } else {
            console.log('Users breakdown by role:');
            const roleCount = {};

            users.forEach(user => {
                roleCount[user.role] = (roleCount[user.role] || 0) + 1;
            });

            console.log(roleCount);
            console.log('\nUser details:');
            users.forEach(user => {
                console.log(`- ${user.fullName} (${user.email}) - Role: ${user.role}`);
            });
        }

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkUsers();
