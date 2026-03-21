const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Import models
const User = require('../src/models/User');
const Faculty = require('../src/models/Faculty');
const Student = require('../src/models/Student');
const Class = require('../src/models/Class');
const Subject = require('../src/models/Subject');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedTestUsers = async () => {
    try {
        console.log('🌱 Seeding database with test users...\n');

        // Get existing classes and subjects
        const classes = await Class.find();
        const subjects = await Subject.find();

        if (classes.length === 0 || subjects.length === 0) {
            console.log('⚠️  Please run seedData.js first to create classes and subjects!');
            process.exit(1);
        }

        // Clear existing test users (keep admin)
        const adminUser = await User.findOne({ role: 'admin' });
        await User.deleteMany({ role: { $ne: 'admin' } });
        await Faculty.deleteMany({});
        await Student.deleteMany({});
        console.log('✅ Cleared existing test users\n');

        // Hash password for all users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Test@123', salt);

        // ==================== CREATE FACULTY ====================
        console.log('👨‍🏫 Creating faculty members...');

        const facultyData = [
            {
                user: {
                    fullName: 'Dr. Rajesh Kumar',
                    email: 'rajesh.kumar@college.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'FAC001',
                department: 'Computer Science'
            },
            {
                user: {
                    fullName: 'Prof. Priya Sharma',
                    email: 'priya.sharma@college.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'FAC002',
                department: 'Computer Science'
            },
            {
                user: {
                    fullName: 'Dr. Amit Patel',
                    email: 'amit.patel@college.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'FAC003',
                department: 'Information Technology'
            },
            {
                user: {
                    fullName: 'Prof. Sunita Singh',
                    email: 'sunita.singh@college.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'FAC004',
                department: 'Electronics'
            }
        ];

        const facultyMembers = [];
        for (const faculty of facultyData) {
            const user = await User.create(faculty.user);
            const facultyDoc = await Faculty.create({
                user: user._id,
                employeeId: faculty.employeeId,
                department: faculty.department
            });
            facultyMembers.push({ user, faculty: facultyDoc });
        }
        console.log(`✅ Created ${facultyMembers.length} faculty members\n`);

        // ==================== CREATE STUDENTS ====================
        console.log('👨‍🎓 Creating students...');

        const studentData = [
            // CS-3A Students
            {
                user: {
                    fullName: 'Rahul Verma',
                    email: 'rahul.verma@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'CS3A001',
                department: 'Computer Science',
                semester: 3,
                className: 'CS-3A'
            },
            {
                user: {
                    fullName: 'Sneha Reddy',
                    email: 'sneha.reddy@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'CS3A002',
                department: 'Computer Science',
                semester: 3,
                className: 'CS-3A'
            },
            {
                user: {
                    fullName: 'Vikram Joshi',
                    email: 'vikram.joshi@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'CS3A003',
                department: 'Computer Science',
                semester: 3,
                className: 'CS-3A'
            },
            // CS-3B Students
            {
                user: {
                    fullName: 'Ananya Gupta',
                    email: 'ananya.gupta@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'CS3B001',
                department: 'Computer Science',
                semester: 3,
                className: 'CS-3B'
            },
            {
                user: {
                    fullName: 'Karan Malhotra',
                    email: 'karan.malhotra@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'CS3B002',
                department: 'Computer Science',
                semester: 3,
                className: 'CS-3B'
            },
            // IT-4A Students
            {
                user: {
                    fullName: 'Pooja Nair',
                    email: 'pooja.nair@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'IT4A001',
                department: 'Information Technology',
                semester: 4,
                className: 'IT-4A'
            },
            {
                user: {
                    fullName: 'Rohit Desai',
                    email: 'rohit.desai@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'IT4A002',
                department: 'Information Technology',
                semester: 4,
                className: 'IT-4A'
            },
            {
                user: {
                    fullName: 'Divya Iyer',
                    email: 'divya.iyer@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'IT4A003',
                department: 'Information Technology',
                semester: 4,
                className: 'IT-4A'
            },
            // EC-5A Students
            {
                user: {
                    fullName: 'Arjun Menon',
                    email: 'arjun.menon@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'EC5A001',
                department: 'Electronics',
                semester: 5,
                className: 'EC-5A'
            },
            {
                user: {
                    fullName: 'Priyanka Rao',
                    email: 'priyanka.rao@student.edu',
                    password: hashedPassword,
                    role: 'student'
                },
                rollNo: 'EC5A002',
                department: 'Electronics',
                semester: 5,
                className: 'EC-5A'
            }
        ];

        const students = [];
        for (const student of studentData) {
            const user = await User.create(student.user);
            const classDoc = await Class.findOne({ name: student.className });
            const studentDoc = await Student.create({
                user: user._id,
                rollNo: student.rollNo,
                department: student.department,
                semester: student.semester,
                class: classDoc._id
            });
            students.push({ user, student: studentDoc });
        }
        console.log(`✅ Created ${students.length} students\n`);

        console.log('🎉 Test users created successfully!\n');
        console.log('📊 Summary:');
        console.log(`   Faculty: ${facultyMembers.length}`);
        console.log(`   Students: ${students.length}\n`);

        console.log('🔑 Test Credentials:');
        console.log('   Password for all users: Test@123\n');

        console.log('👨‍🏫 Faculty Logins:');
        facultyMembers.forEach(f => {
            console.log(`   - ${f.user.email}`);
        });

        console.log('\n👨‍🎓 Student Logins (Sample):');
        students.slice(0, 5).forEach(s => {
            console.log(`   - ${s.user.email}`);
        });
        console.log('   ... and more\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding test users:', error);
        process.exit(1);
    }
};

seedTestUsers();
