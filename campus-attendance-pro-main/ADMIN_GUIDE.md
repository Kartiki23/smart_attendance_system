# Admin Features Guide

## Default Admin Account

**Credentials:**
- Email: `admin@college.edu`
- Password: `Admin@123`

⚠️ **Important:** Change the password after first login!

---

## Admin API Endpoints

### User Management

**Get All Users**
```http
GET /api/admin/users
Authorization: Bearer {admin_token}
```

**Update User Role**
```http
PUT /api/admin/users/:id/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "admin" | "faculty" | "student" | "parent"
}
```

**Delete User**
```http
DELETE /api/admin/users/:id
Authorization: Bearer {admin_token}
```

---

### Class Management

**Get All Classes**
```http
GET /api/admin/classes
Authorization: Bearer {admin_token}
```

**Create Class**
```http
POST /api/admin/classes
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "CS-3A",
  "department": "Computer Science",
  "semester": 3,
  "academicYear": "2025-2026"
}
```

---

### Subject Management

**Get All Subjects**
```http
GET /api/admin/subjects
Authorization: Bearer {admin_token}
```

**Create Subject**
```http
POST /api/admin/subjects
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Data Structures",
  "code": "CS301",
  "department": "Computer Science",
  "credits": 4,
  "semester": 3
}
```

---

### Dashboard Stats

**Get Stats**
```http
GET /api/admin/stats
Authorization: Bearer {admin_token}
```

Returns:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 10,
    "totalStudents": 5,
    "totalFaculty": 3,
    "totalClasses": 4,
    "totalSubjects": 6
  }
}
```

---

## How to Use

### 1. Login as Admin
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "admin@college.edu",
  "password": "Admin@123"
}
```

Copy the `token` from the response.

### 2. Use Admin Endpoints
Add the token to the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Manage Users
- View all users
- Change user roles
- Delete users

### 4. Manage Classes & Subjects
- Create new classes
- Create new subjects
- View all classes/subjects

---

## Security

- All admin routes require authentication (`protect` middleware)
- All admin routes require admin role (`authorize('admin')` middleware)
- Non-admin users will get 403 Forbidden error

---

## Testing with Thunder Client / Postman

1. **Login as admin** → Get token
2. **Create a class** → POST /api/admin/classes
3. **Create subjects** → POST /api/admin/subjects
4. **View all users** → GET /api/admin/users
5. **Get dashboard stats** → GET /api/admin/stats
