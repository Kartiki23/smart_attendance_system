# Complete Backend Setup Guide - Smart Attendance System

## 🎯 Overview

This guide provides step-by-step instructions to set up the complete Firebase backend for the Smart Attendance System from scratch.

---

## 📋 Prerequisites

- Firebase account (free tier is sufficient)
- Node.js 18+ installed
- Firebase CLI installed
- Android Studio (for Android app)
- Basic knowledge of Firebase services

---

## 🚀 Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `smart-attendance-system`
4. Disable Google Analytics (optional for college project)
5. Click **"Create project"**
6. Wait for project creation (30-60 seconds)

### 1.2 Enable Required Services

#### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **Email/Password** provider:
   - Click on **Email/Password**
   - Toggle **Enable**
   - Click **Save**

#### Enable Firestore Database

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll add security rules later)
4. Choose location: **asia-south1** (Mumbai) or nearest to you
5. Click **"Enable"**

#### Enable Cloud Functions

1. Go to **Functions**
2. Click **"Get started"**
3. Accept terms and enable APIs
4. Wait for setup (may take a few minutes)

#### Enable Cloud Messaging (FCM)

1. Go to **Cloud Messaging**
2. Click **"Get started"**
3. Note your **Server key** (you'll need this later)

---

## 🗂️ Step 2: Initialize Firebase in Your Project

### 2.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2.2 Login to Firebase

```bash
firebase login
```

### 2.3 Initialize Firebase in Project

```bash
# Navigate to your project directory
cd campus-attendance-pro-main

# Initialize Firebase
firebase init
```

**Select the following:**
- ✅ Firestore
- ✅ Functions
- ✅ Hosting (optional)

**When prompted:**
- Use existing project: Select your project
- Firestore rules file: `firestore.rules`
- Firestore indexes file: `firestore.indexes.json`
- Functions language: **TypeScript**
- ESLint: **Yes**
- Install dependencies: **Yes**

---

## 📊 Step 3: Create Firestore Collections

### 3.1 Create Collections Manually (via Console)

Go to **Firestore Database** → **Data** tab and create these collections:

1. **users** (will be created automatically when users sign up)
2. **user_roles**
3. **profiles**
4. **students**
5. **faculty**
6. **parents**
7. **subjects**
8. **classes**
9. **lecture_sessions**
10. **attendance**
11. **attendance_stats**
12. **notifications**

**Note**: Collections are created automatically when you add the first document. You can add a dummy document and delete it later.

### 3.2 Create Indexes

Go to **Firestore Database** → **Indexes** tab and create these indexes:

#### Index 1: attendance
- Collection: `attendance`
- Fields:
  - `student_id` (Ascending)
  - `session_id` (Ascending)
- Query scope: Collection

#### Index 2: attendance
- Collection: `attendance`
- Fields:
  - `student_id` (Ascending)
  - `subject_id` (Ascending)
- Query scope: Collection

#### Index 3: attendance
- Collection: `attendance`
- Fields:
  - `session_id` (Ascending)
  - `status` (Ascending)
- Query scope: Collection

#### Index 4: lecture_sessions
- Collection: `lecture_sessions`
- Fields:
  - `faculty_id` (Ascending)
  - `status` (Ascending)
- Query scope: Collection

#### Index 5: lecture_sessions
- Collection: `lecture_sessions`
- Fields:
  - `status` (Ascending)
  - `qr_expires_at` (Ascending)
- Query scope: Collection

#### Index 6: attendance_stats
- Collection: `attendance_stats`
- Fields:
  - `student_id` (Ascending)
  - `subject_id` (Ascending)
- Query scope: Collection

**OR** deploy indexes automatically:

```bash
firebase deploy --only firestore:indexes
```

---

## 🔒 Step 4: Deploy Security Rules

### 4.1 Deploy Rules

```bash
firebase deploy --only firestore:rules
```

### 4.2 Verify Rules

1. Go to **Firestore Database** → **Rules** tab
2. Verify rules are deployed
3. Test rules using Rules Playground (optional)

---

## ☁️ Step 5: Deploy Cloud Functions

### 5.1 Install Dependencies

```bash
cd functions
npm install
cd ..
```

### 5.2 Build Functions

```bash
cd functions
npm run build
cd ..
```

### 5.3 Deploy Functions

```bash
firebase deploy --only functions
```

**Expected Output:**
```
✔  functions[autoMarkAbsentees]: Successful update operation.
✔  functions[calculateAttendancePercentage]: Successful update operation.
✔  functions[cleanupExpiredSessions]: Successful update operation.
✔  functions[recalculateAttendance]: Successful update operation.
```

### 5.4 Verify Functions

1. Go to **Functions** in Firebase Console
2. Verify all functions are deployed
3. Check function logs for any errors

---

## 📱 Step 6: Android App Configuration

### 6.1 Add Android App to Firebase

1. In Firebase Console, go to **Project Settings**
2. Scroll to **"Your apps"** section
3. Click **Android icon** (or **Add app** → **Android**)
4. Enter package name: `com.attendance.app` (or your package)
5. Register app
6. Download `google-services.json`
7. Place it in `app/` directory of Android project

### 6.2 Add Firebase Dependencies

In `app/build.gradle`:

```gradle
dependencies {
    // Firebase BOM
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    
    // Firebase services
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-firestore'
    implementation 'com.google.firebase:firebase-messaging'
    
    // Coroutines for async operations
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3'
}
```

### 6.3 Enable Offline Persistence

In your Application class:

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Enable Firestore offline persistence
        val settings = FirebaseFirestoreSettings.Builder()
            .setPersistenceEnabled(true)
            .build()
        FirebaseFirestore.getInstance().firestoreSettings = settings
    }
}
```

---

## 🧪 Step 7: Test the Backend

### 7.1 Test Authentication

1. Create a test user in Firebase Console → Authentication
2. Try signing in with the app
3. Verify user role is fetched correctly

### 7.2 Test Session Creation

1. Login as faculty
2. Start a session
3. Verify session is created in Firestore
4. Check QR code is generated

### 7.3 Test Attendance Marking

1. Login as student
2. Scan QR code
3. Verify attendance is marked
4. Check Cloud Function triggered (check logs)

### 7.4 Test Auto-Mark Absentees

1. End a session
2. Check Cloud Function logs
3. Verify absent students are marked
4. Check parent notifications are created

---

## 🔔 Step 8: FCM Setup (Optional but Recommended)

### 8.1 Get Server Key

1. Go to **Cloud Messaging** in Firebase Console
2. Copy **Server key**

### 8.2 Configure Android App

1. Add FCM service in `AndroidManifest.xml`
2. Create notification channel
3. Handle token refresh

### 8.3 Test Notifications

1. Send test notification from Firebase Console
2. Verify notification is received on device

---

## 📝 Step 9: Create Initial Data

### 9.1 Create Admin User

1. Create user in Authentication
2. Add document in `user_roles`:
   ```json
   {
     "user_id": "admin_uid",
     "role": "admin",
     "assigned_at": "2025-01-01T00:00:00Z"
   }
   ```

### 9.2 Create Test Subjects

Add documents to `subjects` collection:
```json
{
  "name": "Data Structures",
  "code": "CS301",
  "department_id": "cs",
  "credits": 4,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### 9.3 Create Test Classes

Add documents to `classes` collection:
```json
{
  "name": "CS-3A",
  "department": "Computer Science",
  "semester": 5,
  "academic_year": "2024-2025",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Cloud Functions enabled
- [ ] Security rules deployed
- [ ] Database indexes created
- [ ] Cloud Functions deployed
- [ ] Android app configured
- [ ] Test user created
- [ ] Initial data added
- [ ] Test attendance flow works
- [ ] Cloud Functions trigger correctly
- [ ] Notifications work (if FCM configured)

---

## 🐛 Troubleshooting

### Functions Not Deploying

```bash
# Check Node.js version
node --version  # Should be 18+

# Reinstall dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
npm run build
cd ..
firebase deploy --only functions
```

### Security Rules Errors

```bash
# Test rules locally
firebase emulators:start --only firestore

# Check rules syntax
firebase deploy --only firestore:rules --debug
```

### Index Errors

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Wait for index creation (may take 5-10 minutes)
```

---

## 📚 Next Steps

1. **Read Documentation**:
   - `FIRESTORE_SCHEMA.md` - Database structure
   - `BACKEND_DOCUMENTATION.md` - Complete backend docs
   - `android/FirebaseHelper.kt` - Android integration

2. **Test All Features**:
   - Authentication
   - Session creation
   - Attendance marking
   - Auto-mark absentees
   - Notifications

3. **Monitor**:
   - Check Cloud Functions logs
   - Monitor Firestore usage
   - Check error logs

---

## 🎓 For Viva Presentation

**Key Points to Explain:**

1. **Why Firebase?**
   - Real-time database
   - Scalable
   - Offline support
   - Free tier sufficient for college project

2. **Security Rules:**
   - Role-based access
   - Prevents unauthorized access
   - Validates data on server

3. **Cloud Functions:**
   - Auto-mark absentees
   - Calculate statistics
   - Send notifications
   - Cleanup expired sessions

4. **Mobile Optimization:**
   - Offline persistence
   - Batch writes
   - Efficient queries
   - Cached data

---

**Setup Complete!** 🎉

Your backend is now ready for the Smart Attendance System.

---

**Last Updated**: January 2025  
**Version**: 1.0.0

