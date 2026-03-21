const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const User = require('./src/models/User');
const Faculty = require('./src/models/Faculty');

const facultyData = [
    {
        fullName: "Prof. Lal A.K.",
        email: "lal.ak@polytechnic.edu",
        password: "password123",
        department: "Computer Engineering",
        employeeId: "GPT/LAL/STAFF"
    },
    {
        fullName: "Pranita Kshirsagar",
        email: "pranita.k@polytechnic.edu",
        password: "password123",
        department: "Computer Engineering",
        employeeId: "GPT/PRANITA/STAFF"
    },
    {
        fullName: "Sangita Tanaji Mahadkar",
        email: "sangita.mahadkar@polytechnic.edu",
        password: "password123",
        department: "Computer Engineering",
        employeeId: "GPT/SANGITA/STAFF"
    },
    {
        fullName: "Sanjay Ashok Shinde",
        email: "sanjay.shinde@polytechnic.edu",
        password: "password123",
        department: "Computer Engineering",
        employeeId: "GPT/SANJAY/STAFF"
    },
    {
        fullName: "Shahaji Bhanudas Kadam",
        email: "shahaji.kadam@polytechnic.edu",
        password: "password123",
        department: "Computer Engineering",
        employeeId: "GPT/SHAHAJI/STAFF"
    }
];

const seedFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB\n');
        console.log('🌱 Seeding faculty data...\n');

        let created = 0;
        let skipped = 0;

        for (const faculty of facultyData) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: faculty.email });

            if (existingUser) {
                console.log(`⏭️  Skipped: ${faculty.fullName} (${faculty.email}) - already exists`);
                skipped++;
                continue;
            }

            // Create user
            const user = await User.create({
                fullName: faculty.fullName,
                email: faculty.email,
                password: faculty.password,
                role: 'faculty'
            });

            // Create faculty record
            await Faculty.create({
                user: user._id,
                employeeId: faculty.employeeId,
                department: faculty.department
            });

            console.log(`✅ Created: ${faculty.fullName} (${faculty.email})`);
            created++;
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Created: ${created} faculty members`);
        console.log(`   Skipped: ${skipped} (already exist)`);
        console.log(`   Total: ${facultyData.length} faculty in seed data`);

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedFaculty();
