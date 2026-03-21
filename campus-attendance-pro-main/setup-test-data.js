/**
 * Firebase Test Data Setup Script
 * Run this script to automatically create test users and populate Firestore
 * 
 * Usage: node setup-test-data.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to download this

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function setupTestData() {
    console.log('🚀 Starting Firebase test data setup...\n');

    try {
        // Step 1: Create Authentication Users
        console.log('📝 Creating authentication users...');

        const adminUser = await createUser('admin@college.edu', 'Admin@123', 'Admin User');
        const facultyUser = await createUser('faculty@college.edu', 'Faculty@123', 'Dr. John Smith');
        const studentUser = await createUser('student@college.edu', 'Student@123', 'Jane Doe');

        console.log(`✅ Admin UID: ${adminUser.uid}`);
        console.log(`✅ Faculty UID: ${facultyUser.uid}`);
        console.log(`✅ Student UID: ${studentUser.uid}\n`);

        // Step 2: Create User Roles
        console.log('📝 Creating user roles...');
        await db.collection('user_roles').doc(adminUser.uid).set({
            user_id: adminUser.uid,
            role: 'admin',
            assigned_at: new Date().toISOString()
        });

        await db.collection('user_roles').doc(facultyUser.uid).set({
            user_id: facultyUser.uid,
            role: 'faculty',
            assigned_at: new Date().toISOString()
        });

        await db.collection('user_roles').doc(studentUser.uid).set({
            user_id: studentUser.uid,
            role: 'student',
            assigned_at: new Date().toISOString()
        });
        console.log('✅ User roles created\n');

        // Step 3: Create Profiles
        console.log('📝 Creating user profiles...');
        await db.collection('profiles').doc(adminUser.uid).set({
            id: adminUser.uid,
            full_name: 'Admin User',
            email: 'admin@college.edu',
            avatar_url: '',
            updated_at: new Date().toISOString()
        });

        await db.collection('profiles').doc(facultyUser.uid).set({
            id: facultyUser.uid,
            full_name: 'Dr. John Smith',
            email: 'faculty@college.edu',
            avatar_url: '',
            updated_at: new Date().toISOString()
        });

        await db.collection('profiles').doc(studentUser.uid).set({
            id: studentUser.uid,
            full_name: 'Jane Doe',
            email: 'student@college.edu',
            avatar_url: '',
            updated_at: new Date().toISOString()
        });
        console.log('✅ User profiles created\n');

        // Step 4: Create Classes
        console.log('📝 Creating classes...');
        const classRef = await db.collection('classes').add({
            name: 'CS-3A',
            department: 'Computer Science',
            semester: 3,
            academic_year: '2025-2026',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        console.log(`✅ Class created: ${classRef.id}\n`);

        // Step 5: Create Subjects
        console.log('📝 Creating subjects...');
        const subject1Ref = await db.collection('subjects').add({
            name: 'Data Structures',
            code: 'CS301',
            department_id: 'cs',
            credits: 4,
            semester: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        const subject2Ref = await db.collection('subjects').add({
            name: 'Algorithms',
            code: 'CS302',
            department_id: 'cs',
            credits: 4,
            semester: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        console.log(`✅ Subjects created: ${subject1Ref.id}, ${subject2Ref.id}\n`);

        // Step 6: Create Student Record
        console.log('📝 Creating student record...');
        await db.collection('students').doc(studentUser.uid).set({
            name: 'Jane Doe',
            rollNo: 'CS2023001',
            department: 'Computer Science',
            semester: 3,
            class_id: classRef.id,
            attendance_percentage: 0,
            last_attendance_update: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        console.log('✅ Student record created\n');

        // Step 7: Create Faculty Record
        console.log('📝 Creating faculty record...');
        await db.collection('faculty').doc(facultyUser.uid).set({
            name: 'Dr. John Smith',
            subjects: [subject1Ref.id, subject2Ref.id],
            department: 'Computer Science',
            employee_id: 'FAC001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        console.log('✅ Faculty record created\n');

        console.log('🎉 Test data setup complete!\n');
        console.log('📋 Test Credentials:');
        console.log('   Admin:   admin@college.edu / Admin@123');
        console.log('   Faculty: faculty@college.edu / Faculty@123');
        console.log('   Student: student@college.edu / Student@123\n');

    } catch (error) {
        console.error('❌ Error setting up test data:', error);
        process.exit(1);
    }

    process.exit(0);
}

async function createUser(email, password, displayName) {
    try {
        const userRecord = await auth.createUser({
            email: email,
            password: password,
            displayName: displayName,
            emailVerified: true
        });
        return userRecord;
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log(`⚠️  User ${email} already exists, fetching existing user...`);
            const existingUser = await auth.getUserByEmail(email);
            return existingUser;
        }
        throw error;
    }
}

setupTestData();
