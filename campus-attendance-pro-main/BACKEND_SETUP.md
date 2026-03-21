# Complete Setup Guide - Node.js Backend

## Prerequisites

1. **MongoDB**: Install MongoDB locally or use MongoDB Atlas (cloud)
   - Local: Download from https://www.mongodb.com/try/download/community
   - Cloud: Create free cluster at https://www.mongodb.com/cloud/atlas

2. **Node.js**: Version 18+ (already installed)

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
The `.env` file is already created. If using MongoDB Atlas, update `MONGODB_URI`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance-system
```

### 3. Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
```

---

## Frontend Setup

### 1. Install Axios (if not done)
```bash
cd ..
npm install axios
```

### 2. Start Frontend
```bash
npm run dev
```

---

## Testing the Application

### 1. Register a New User
- Open http://localhost:5173
- Click "Sign Up"
- Enter:
  - Full Name: `Test User`
  - Email: `test@example.com`
  - Password: `test123`
- Click "Create Account"

### 2. Login
- Use the credentials you just created
- You should be redirected to the Student Dashboard

### 3. Test API Endpoints (Optional)

Using Thunder Client or Postman:

**Register:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Current User:**
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer {your_token_here}
```

---

## What's Working

✅ Backend Express server with MongoDB
✅ User registration with password hashing
✅ User login with JWT tokens
✅ Protected routes with JWT middleware
✅ Frontend login/register pages
✅ Auth state management
✅ Automatic token refresh

---

## Next Steps

1. **Add More Routes**: Attendance marking, sessions, etc.
2. **Role-Based Dashboards**: Different views for admin/faculty/student
3. **QR Code Generation**: For attendance sessions
4. **GPS Validation**: Location-based attendance

---

## Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running locally
- Or update `.env` with MongoDB Atlas connection string

**Port Already in Use:**
- Change PORT in `backend/.env` to different number

**CORS Error:**
- Backend is configured for `http://localhost:5173`
- If frontend runs on different port, update `backend/src/server.js`
