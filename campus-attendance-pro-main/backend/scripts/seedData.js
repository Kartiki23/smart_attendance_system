const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import models
const Class = require('../src/models/Class');
const Subject = require('../src/models/Subject');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedData = async () => {
    try {
        console.log('🌱 Seeding database with sample data...\n');

        // Clear existing data
        await Class.deleteMany({});
        await Subject.deleteMany({});
        console.log('✅ Cleared existing classes and subjects\n');

        // Create Classes
        console.log('📚 Creating classes...');
        const classes = await Class.insertMany([
            {
                name: 'CS-3A',
                department: 'Computer Science',
                semester: 3,
                academicYear: '2025-2026'
            },
            {
                name: 'CS-3B',
                department: 'Computer Science',
                semester: 3,
                academicYear: '2025-2026'
            },
            {
                name: 'IT-4A',
                department: 'Information Technology',
                semester: 4,
                academicYear: '2025-2026'
            },
            {
                name: 'EC-5A',
                department: 'Electronics',
                semester: 5,
                academicYear: '2025-2026'
            }
        ]);
        console.log(`✅ Created ${classes.length} classes\n`);

        // Create Subjects
        console.log('📖 Creating subjects...');
        const subjects = await Subject.insertMany([
            {
                name: 'Data Structures',
                code: 'CS301',
                department: 'Computer Science',
                credits: 4,
                semester: 3
            },
            {
                name: 'Algorithms',
                code: 'CS302',
                department: 'Computer Science',
                credits: 4,
                semester: 3
            },
            {
                name: 'Database Management Systems',
                code: 'CS303',
                department: 'Computer Science',
                credits: 4,
                semester: 3
            },
            {
                name: 'Operating Systems',
                code: 'CS304',
                department: 'Computer Science',
                credits: 4,
                semester: 3
            },
            {
                name: 'Computer Networks',
                code: 'IT401',
                department: 'Information Technology',
                credits: 4,
                semester: 4
            },
            {
                name: 'Web Development',
                code: 'IT402',
                department: 'Information Technology',
                credits: 3,
                semester: 4
            },
            {
                name: 'Machine Learning',
                code: 'CS501',
                department: 'Computer Science',
                credits: 4,
                semester: 5
            },
            {
                name: 'Artificial Intelligence',
                code: 'CS502',
                department: 'Computer Science',
                credits: 4,
                semester: 5
            },
            {
                name: 'Digital Electronics',
                code: 'EC501',
                department: 'Electronics',
                credits: 4,
                semester: 5
            },
            {
                name: 'Microprocessors',
                code: 'EC502',
                department: 'Electronics',
                credits: 4,
                semester: 5
            }
        ]);
        console.log(`✅ Created ${subjects.length} subjects\n`);

        console.log('🎉 Database seeded successfully!\n');
        console.log('📊 Summary:');
        console.log(`   Classes: ${classes.length}`);
        console.log(`   Subjects: ${subjects.length}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
