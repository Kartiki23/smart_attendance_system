# Quick Setup Guide - Smart Attendance System

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Get your Firebase config

### 3. Set Environment Variables

Create `.env` file in project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Initialize Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting (optional)

### 5. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 6. Deploy Database Indexes

```bash
firebase deploy --only firestore:indexes
```

### 7. Deploy Cloud Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 8. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:8080

---

## 📋 Initial Data Setup

### Create Test Users

1. **Admin User**
   - Create user in Firebase Authentication
   - Create document in `user_roles/{userId}`:
     ```json
     {
       "user_id": "userId",
       "role": "admin",
       "assigned_at": "2025-01-01T00:00:00Z"
     }
     ```

2. **Faculty User**
   - Create user in Firebase Authentication
   - Create document in `user_roles/{userId}` with role: "faculty"
   - Create document in `faculty/{userId}`:
     ```json
     {
       "name": "Faculty Name",
       "subjects": [],
       "department": "Computer Science"
     }
     ```

3. **Student User**
   - Create user in Firebase Authentication
   - Create document in `user_roles/{userId}` with role: "student"
   - Create document in `students/{userId}`:
     ```json
     {
       "name": "Student Name",
       "rollNo": "CS2024-001",
       "department": "Computer Science",
       "semester": 5,
       "class_id": "classId",
       "attendance_percentage": 0
     }
     ```

### Create Subjects

Add documents to `subjects` collection:
```json
{
  "name": "Data Structures",
  "code": "CS301",
  "department_id": "deptId",
  "credits": 4
}
```

### Create Classes

Add documents to `classes` collection:
```json
{
  "name": "CS-3A",
  "department": "Computer Science",
  "semester": 5
}
```

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Environment variables set
- [ ] Security rules deployed
- [ ] Database indexes deployed
- [ ] Cloud Functions deployed
- [ ] Test users created
- [ ] Subjects and classes created
- [ ] Development server running

---

## 🎯 Testing the System

1. **Login as Faculty**
   - Start a session
   - Verify QR code is generated
   - Check GPS location is captured

2. **Login as Student**
   - Scan QR code
   - Verify attendance is marked
   - Check attendance stats update

3. **Login as Admin**
   - View all data
   - Manage users
   - View reports

---

## 📚 Documentation

- **Backend Documentation**: See `BACKEND_DOCUMENTATION.md`
- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md`
- **Security Rules**: See `firestore.rules`
- **Cloud Functions**: See `functions/src/index.ts`

---

## 🆘 Troubleshooting

### "Permission denied" errors
- Check Security Rules are deployed
- Verify user role in `user_roles` collection
- Check user is authenticated

### Cloud Functions not working
- Check function logs: `firebase functions:log`
- Verify functions are deployed: `firebase functions:list`
- Check Firestore triggers are enabled

### GPS not working
- Ensure location permissions are granted
- Check browser supports geolocation API
- Verify `gps_required` flag in session

---

**Need Help?** Check the full documentation in `BACKEND_DOCUMENTATION.md`

