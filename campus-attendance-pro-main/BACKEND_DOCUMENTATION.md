# Smart Attendance System - Backend Documentation

## 📋 Table of Contents
1. [Firestore Database Structure](#firestore-database-structure)
2. [Firebase Security Rules](#firebase-security-rules)
3. [Cloud Functions](#cloud-functions)
4. [Backend Services](#backend-services)
5. [API Reference](#api-reference)
6. [Deployment Guide](#deployment-guide)

---

## 🗂️ Firestore Database Structure

### Collections Overview

#### 1. **users** (Firebase Auth + Firestore)
```
users/{userId}
├── name: string
├── email: string
├── phone: string
├── collegeId: string
└── role: "admin" | "faculty" | "student" | "parent"
```

#### 2. **user_roles**
```
user_roles/{userId}
├── user_id: string
├── role: "admin" | "faculty" | "student" | "parent"
└── assigned_at: timestamp
```

#### 3. **profiles**
```
profiles/{userId}
├── id: string
├── full_name: string
├── email: string
└── avatar_url: string (optional)
```

#### 4. **students**
```
students/{studentId}
├── name: string
├── rollNo: string
├── department: string
├── semester: number
├── class_id: string
├── parent_id: string (optional)
├── attendance_percentage: number
└── last_attendance_update: timestamp
```

#### 5. **faculty**
```
faculty/{facultyId}
├── name: string
├── subjects: string[] (array of subject IDs)
└── department: string
```

#### 6. **parents**
```
parents/{parentId}
├── name: string
├── email: string
├── phone: string
└── student_id: string (linked student)
```

#### 7. **subjects**
```
subjects/{subjectId}
├── name: string
├── code: string
├── department_id: string
└── credits: number (optional)
```

#### 8. **classes**
```
classes/{classId}
├── name: string
├── department: string
└── semester: number
```

#### 9. **lecture_sessions** ⭐ CRITICAL
```
lecture_sessions/{sessionId}
├── subject_id: string
├── class_id: string
├── faculty_id: string
├── status: "scheduled" | "active" | "completed" | "cancelled"
├── start_time: timestamp
├── end_time: timestamp (optional)
├── qr_code: string (unique QR code string)
├── qr_expires_at: timestamp
├── gps_required: boolean
├── location_lat: number (optional)
└── location_lng: number (optional)
```

#### 10. **attendance** ⭐ CRITICAL
```
attendance/{attendanceId}
├── student_id: string
├── session_id: string
├── subject_id: string
├── faculty_id: string
├── status: "present" | "absent" | "late"
├── timestamp: timestamp
├── marked_at: timestamp
├── is_verified: boolean
├── qr_code: string (QR code used)
├── location_lat: number (optional)
└── location_lng: number (optional)
```

#### 11. **attendance_stats** (Computed)
```
attendance_stats/{studentId}_{subjectId}
├── student_id: string
├── subject_id: string
├── total_classes: number
├── present_count: number
├── absent_count: number
├── percentage: number
└── last_updated: timestamp
```

#### 12. **notifications**
```
notifications/{notificationId}
├── user_id: string
├── type: "absence" | "late" | "low_attendance"
├── title: string
├── message: string
├── student_id: string (optional)
├── session_id: string (optional)
├── read: boolean
└── created_at: timestamp
```

---

## 🔒 Firebase Security Rules

### Key Security Features

1. **Role-Based Access Control**
   - Each user has a role stored in `user_roles` collection
   - Rules check role before allowing access

2. **Student Attendance Protection**
   - Students can only mark their own attendance
   - Prevents duplicate attendance
   - Validates session is active
   - Verifies QR code matches

3. **Parent Access**
   - Parents can only view their linked student's data
   - Cannot modify any records

4. **Faculty Access**
   - Can create/update their own sessions
   - Can view attendance for their sessions
   - Cannot access other faculty's data

5. **Admin Access**
   - Full read/write access to all collections
   - Can manage users, subjects, classes

### Important Rules

- **Attendance Creation**: Validates session exists, is active, QR matches, not expired, and no duplicate
- **Session Updates**: Only faculty who created session can update
- **Stats**: Read-only for users, write-only by Cloud Functions

See `firestore.rules` for complete implementation.

---

## ☁️ Cloud Functions

### 1. **autoMarkAbsentees**
**Trigger**: When `lecture_sessions` document status changes to "completed"

**Functionality**:
- Gets all students enrolled in the class
- Gets all students who marked attendance
- Marks remaining students as "absent"
- Triggers parent notifications for absent students

**Code Location**: `functions/src/index.ts`

### 2. **calculateAttendancePercentage**
**Trigger**: When new attendance record is created

**Functionality**:
- Calculates attendance percentage for student + subject
- Updates `attendance_stats` collection
- Updates overall attendance in `students` collection

**Code Location**: `functions/src/index.ts`

### 3. **cleanupExpiredSessions**
**Trigger**: Runs every hour (scheduled)

**Functionality**:
- Finds all active sessions with expired QR codes
- Marks them as "completed"
- Triggers auto-mark absentees

**Code Location**: `functions/src/index.ts`

### 4. **recalculateAttendance** (HTTP)
**Endpoint**: `https://YOUR_PROJECT.cloudfunctions.net/recalculateAttendance`

**Parameters**:
- `studentId`: Student ID
- `subjectId`: Subject ID

**Functionality**:
- Manually recalculates attendance for a student/subject
- Useful for admin corrections

---

## 🔧 Backend Services

### Attendance Service (`src/lib/attendanceService.ts`)

#### Core Functions

##### `markAttendance(studentId, qrCodeData, studentLocation?)`
Main function to mark student attendance.

**Validation Steps**:
1. Validates QR code data structure
2. Verifies session exists and is active
3. Verifies QR code matches session
4. Checks for duplicate attendance
5. Verifies GPS location (if required)
6. Verifies student enrollment
7. Creates attendance record

**Returns**: `AttendanceResult` with success status and message

##### `verifySession(sessionId, qrCode)`
Validates session is active and QR code matches.

##### `verifyGPSLocation(studentLocation, sessionId, allowedRadiusMeters?)`
Calculates distance between student and classroom.
- Uses Haversine formula
- Default radius: 50 meters
- Returns validation result with distance

##### `checkDuplicateAttendance(studentId, sessionId)`
Prevents students from marking attendance twice.

##### `getStudentAttendanceStats(studentId, subjectId?)`
Gets attendance statistics for a student.

##### `getRecentAttendance(studentId, limit?)`
Gets recent attendance records.

---

## 📡 API Reference

### Frontend → Backend Flow

#### 1. **Faculty Starts Session**
```typescript
// FacultyDashboard.tsx
const sessionData = {
  subject_id: selectedSubject,
  class_id: selectedClass,
  faculty_id: user.uid,
  status: "active",
  qr_code: generateQRCode(),
  qr_expires_at: expiresAt,
  gps_required: true,
  location_lat: position.coords.latitude,
  location_lng: position.coords.longitude,
};
await addDoc(collection(db, "lecture_sessions"), sessionData);
```

#### 2. **Student Scans QR Code**
```typescript
// QRScanner.tsx
const qrCodeData = JSON.parse(qrCodeString);
const result = await markAttendance(
  studentId,
  qrCodeData,
  { latitude, longitude }
);
```

#### 3. **Get Attendance Stats**
```typescript
const stats = await getStudentAttendanceStats(studentId);
// Returns: { overallPercentage, subjectStats[] }
```

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- Firebase CLI installed
- Firebase project created

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### Step 2: Configure Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting (optional)
```

### Step 3: Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### Step 4: Deploy Cloud Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Step 5: Set Environment Variables

Create `.env` file in project root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 6: Deploy Frontend (if using Firebase Hosting)

```bash
npm run build
firebase deploy --only hosting
```

---

## 🔐 Security Best Practices

1. **Never expose Firebase Admin SDK keys** in frontend
2. **Always validate on backend** (Security Rules + Cloud Functions)
3. **Use HTTPS** for all connections
4. **Enable App Check** for production
5. **Monitor Security Rules** regularly
6. **Rate limit** attendance marking (prevent spam)

---

## 📊 Database Indexes Required

Create these indexes in Firestore Console:

1. **attendance**
   - `student_id` (Ascending) + `session_id` (Ascending)
   - `student_id` (Ascending) + `subject_id` (Ascending)
   - `session_id` (Ascending) + `status` (Ascending)

2. **lecture_sessions**
   - `faculty_id` (Ascending) + `status` (Ascending)
   - `status` (Ascending) + `qr_expires_at` (Ascending)

3. **attendance_stats**
   - `student_id` (Ascending) + `subject_id` (Ascending)

---

## 🐛 Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check Security Rules
   - Verify user role in `user_roles` collection
   - Check user authentication

2. **GPS validation failing**
   - Ensure location permissions granted
   - Check `gps_required` flag in session
   - Verify location coordinates are valid

3. **Duplicate attendance**
   - Check `checkDuplicateAttendance` function
   - Verify Security Rules prevent duplicates

4. **Cloud Functions not triggering**
   - Check function logs: `firebase functions:log`
   - Verify function deployment: `firebase functions:list`
   - Check Firestore triggers are enabled

---

## 📝 Notes

- **QR Code Expiry**: Default 5 minutes
- **GPS Radius**: Default 50 meters (configurable)
- **Session Auto-Expiry**: Runs every hour via scheduled function
- **Attendance Calculation**: Automatic on each attendance record creation

---

## 🎓 College Project Requirements

✅ Role-based authentication  
✅ QR code attendance  
✅ GPS validation  
✅ Duplicate prevention  
✅ Auto-mark absentees  
✅ Parent notifications  
✅ Attendance percentage calculation  
✅ Security rules  
✅ Cloud Functions  
✅ Mobile-friendly  
✅ Scalable architecture  

---

**Last Updated**: January 2025  
**Version**: 1.0.0

