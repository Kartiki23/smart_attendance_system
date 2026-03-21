# Quick Firebase Setup Guide

## Option 1: Automated Setup (Recommended)

### Step 1: Download Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `college-management-syste-7e0de`
3. Click ⚙️ (Settings) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the file as `serviceAccountKey.json` in the project root

### Step 2: Install Firebase Admin SDK
```bash
npm install firebase-admin --save-dev
```

### Step 3: Run Setup Script
```bash
node setup-test-data.js
```

This will automatically create:
- ✅ 3 authentication users (admin, faculty, student)
- ✅ User roles and profiles
- ✅ Test class (CS-3A)
- ✅ Test subjects (Data Structures, Algorithms)
- ✅ Student and faculty records

---

## Option 2: Manual Setup

Follow the detailed guide in `test_data_setup.md` artifact.

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@college.edu | Admin@123 |
| **Faculty** | faculty@college.edu | Faculty@123 |
| **Student** | student@college.edu | Student@123 |

---

## Start the Application

```bash
npm run dev
```

Then open http://localhost:5173 and login with any of the credentials above.
