const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Import models
const User = require('../src/models/User');
const Faculty = require('../src/models/Faculty');
const Subject = require('../src/models/Subject');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const addTimetableFaculty = async () => {
    try {
        console.log('🌱 Adding faculty from Third Year CS Timetable...\n');

        // Hash password for all faculty
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Faculty@123', salt);

        // Get existing subjects to assign
        const subjects = await Subject.find();

        // Create faculty based on timetable
        const facultyData = [
            {
                user: {
                    fullName: 'Prof. Malhotra D.K.',
                    email: 'mal.dk@polytechnic.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'MAL',
                department: 'Computer Science',
                subjects: ['Computer Software & Systems']
            },
            {
                user: {
                    fullName: 'Prof. Deshmukh I.S.',
                    email: 'disp.is@polytechnic.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'DISP',
                department: 'Computer Science',
                subjects: ['Mathematics', 'Data Structures', 'Algorithms']
            },
            {
                user: {
                    fullName: 'Prof. Patel S.E.',
                    email: 'pse.se@polytechnic.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'PSE',
                department: 'Computer Science',
                subjects: ['Information Technology', 'Web Development']
            },
            {
                user: {
                    fullName: 'Prof. Iyer S.E.',
                    email: 'ise.se@polytechnic.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'ISE',
                department: 'Computer Science',
                subjects: ['System Integration & Testing', 'Operating Systems']
            },
            {
                user: {
                    fullName: 'Prof. Chaudhary P.L.',
                    email: 'cpe.pl@polytechnic.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'CPE',
                department: 'Computer Science',
                subjects: ['Computer Programming', 'Database Management Systems']
            },
            {
                user: {
                    fullName: 'Prof. Lal A.K.',
                    email: 'lal.ak@polytechnic.edu',
                    password: hashedPassword,
                    role: 'faculty'
                },
                employeeId: 'LAL',
                department: 'Computer Science',
                subjects: ['Laboratory Practices']
            }
        ];

        console.log('👨‍🏫 Creating faculty accounts...');
        const facultyMembers = [];

        for (const faculty of facultyData) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: faculty.user.email });
            if (existingUser) {
                console.log(`   ⚠️  Faculty ${faculty.user.email} already exists, skipping...`);
                continue;
            }

            // Create user account
            const user = await User.create(faculty.user);

            // Find matching subjects from database
            const subjectIds = [];
            for (const subjectName of faculty.subjects) {
                const subject = subjects.find(s => s.name.includes(subjectName.split(' ')[0]));
                if (subject) {
                    subjectIds.push(subject._id);
                }
            }

            // Create faculty record
            const facultyDoc = await Faculty.create({
                user: user._id,
                employeeId: faculty.employeeId,
                department: faculty.department,
                subjects: subjectIds
            });

            facultyMembers.push({ user, faculty: facultyDoc });
            console.log(`   ✅ Created: ${faculty.user.fullName} (${faculty.employeeId})`);
        }

        console.log(`\n✅ Created ${facultyMembers.length} new faculty members\n`);

        console.log('🎉 Faculty members added successfully!\n');
        console.log('📊 Summary:');
        console.log(`   New Faculty Added: ${facultyMembers.length}`);
        console.log(`   Department: Computer Science\n`);

        console.log('🔑 Faculty Credentials:');
        console.log('   Password for all faculty: Faculty@123\n');

        console.log('👨‍🏫 Faculty Logins:');
        facultyMembers.forEach(f => {
            console.log(`   - ${f.user.email} (${f.faculty.employeeId})`);
        });
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding faculty:', error);
        process.exit(1);
    }
};

addTimetableFaculty();
