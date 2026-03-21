# Firestore Database Schema - Complete Structure

## 📋 Overview

This document defines the complete Firestore database structure for the Smart Attendance System.

---

## 🗂️ Collections

### 1. **users** (Firebase Auth + Firestore Profile)

**Purpose**: User profile information linked to Firebase Authentication

**Document ID**: `{userId}` (Firebase Auth UID)

```typescript
{
  name: string;              // Full name
  email: string;             // Email address
  phone: string;             // Phone number (optional)
  collegeId: string;         // College identifier
  avatar_url?: string;       // Profile picture URL (optional)
  created_at: Timestamp;     // Account creation time
  updated_at: Timestamp;     // Last update time
}
```

**Indexes Required**: None (direct document access by UID)

---

### 2. **user_roles**

**Purpose**: Role-based access control mapping

**Document ID**: `{userId}` (Firebase Auth UID)

```typescript
{
  user_id: string;           // Firebase Auth UID
  role: "admin" | "faculty" | "student" | "parent";
  assigned_at: Timestamp;    // When role was assigned
  assigned_by?: string;      // Admin UID who assigned (optional)
}
```

**Indexes Required**: None

**Security**: Only admins can create/update

---

### 3. **profiles**

**Purpose**: Extended user profile data

**Document ID**: `{userId}` (Firebase Auth UID)

```typescript
{
  id: string;                // User UID
  full_name: string;         // Full name
  email: string;             // Email
  avatar_url?: string;       // Profile picture (optional)
  updated_at: Timestamp;     // Last update
}
```

**Indexes Required**: None

---

### 4. **students**

**Purpose**: Student information and enrollment

**Document ID**: `{studentId}` (usually Firebase Auth UID)

```typescript
{
  name: string;              // Student full name
  rollNo: string;            // Roll number (unique)
  department: string;         // Department name
  semester: number;          // Current semester
  class_id: string;          // Reference to classes collection
  parent_id?: string;        // Reference to parents collection (optional)
  attendance_percentage: number;  // Overall attendance (0-100)
  last_attendance_update: Timestamp;  // Last stats update
  created_at: Timestamp;      // Record creation
  updated_at: Timestamp;     // Last update
}
```

**Indexes Required**:
- `class_id` (Ascending)
- `rollNo` (Ascending) - for uniqueness
- `department` (Ascending) + `semester` (Ascending)

---

### 5. **faculty**

**Purpose**: Faculty member information

**Document ID**: `{facultyId}` (usually Firebase Auth UID)

```typescript
{
  name: string;              // Faculty full name
  subjects: string[];        // Array of subject IDs
  department: string;         // Department name
  employee_id: string;       // Employee ID (unique)
  created_at: Timestamp;     // Record creation
  updated_at: Timestamp;     // Last update
}
```

**Indexes Required**:
- `department` (Ascending)
- `employee_id` (Ascending) - for uniqueness

---

### 6. **parents**

**Purpose**: Parent/guardian information

**Document ID**: `{parentId}` (usually Firebase Auth UID)

```typescript
{
  name: string;              // Parent full name
  email: string;             // Email address
  phone: string;             // Phone number
  student_id: string;        // Reference to students collection
  fcm_token?: string;        // FCM token for push notifications (optional)
  created_at: Timestamp;      // Record creation
  updated_at: Timestamp;     // Last update
}
```

**Indexes Required**:
- `student_id` (Ascending)
- `email` (Ascending) - for uniqueness

---

### 7. **subjects**

**Purpose**: Subject/course information

**Document ID**: `{subjectId}` (auto-generated)

```typescript
{
  name: string;              // Subject name
  code: string;              // Subject code (e.g., "CS301")
  department_id: string;      // Reference to departments (optional)
  credits?: number;           // Credit hours (optional)
  semester?: number;          // Semester offered (optional)
  created_at: Timestamp;      // Record creation
  updated_at: Timestamp;     // Last update
}
```

**Indexes Required**:
- `code` (Ascending) - for uniqueness
- `department_id` (Ascending)
- `semester` (Ascending)

---

### 8. **classes**

**Purpose**: Class/section information

**Document ID**: `{classId}` (auto-generated)

```typescript
{
  name: string;              // Class name (e.g., "CS-3A")
  department: string;         // Department name
  semester: number;          // Semester
  academic_year: string;     // Academic year (e.g., "2024-2025")
  created_at: Timestamp;      // Record creation
  updated_at: Timestamp;     // Last update
}
```

**Indexes Required**:
- `department` (Ascending) + `semester` (Ascending)
- `academic_year` (Ascending)

---

### 9. **lecture_sessions** ⭐ CRITICAL

**Purpose**: Active lecture sessions with QR codes

**Document ID**: `{sessionId}` (auto-generated)

```typescript
{
  subject_id: string;         // Reference to subjects
  class_id: string;          // Reference to classes
  faculty_id: string;        // Reference to faculty (Firebase Auth UID)
  status: "scheduled" | "active" | "completed" | "cancelled";
  start_time: Timestamp;      // Session start time
  end_time?: Timestamp;       // Session end time (optional)
  qr_code: string;           // Unique QR code string
  qr_expires_at: Timestamp;   // QR code expiry time
  gps_required: boolean;      // Whether GPS validation is required
  location_lat?: number;      // Classroom latitude (optional)
  location_lng?: number;      // Classroom longitude (optional)
  gps_radius_meters: number;  // Allowed GPS radius (default: 50)
  created_at: Timestamp;      // Record creation
  updated_at: Timestamp;     // Last update
}
```

**Indexes Required**:
- `faculty_id` (Ascending) + `status` (Ascending)
- `status` (Ascending) + `qr_expires_at` (Ascending)
- `class_id` (Ascending) + `status` (Ascending)
- `subject_id` (Ascending) + `status` (Ascending)

---

### 10. **attendance** ⭐ CRITICAL

**Purpose**: Individual attendance records

**Document ID**: `{attendanceId}` (auto-generated)

```typescript
{
  student_id: string;        // Reference to students (Firebase Auth UID)
  session_id: string;        // Reference to lecture_sessions
  subject_id: string;        // Reference to subjects
  faculty_id: string;        // Reference to faculty
  status: "present" | "absent" | "late";
  timestamp: Timestamp;       // When attendance was marked
  marked_at: Timestamp;      // Server timestamp
  is_verified: boolean;      // Whether attendance was verified
  qr_code: string;           // QR code used (for verification)
  location_lat?: number;      // Student location latitude (optional)
  location_lng?: number;      // Student location longitude (optional)
  distance_meters?: number;   // Distance from classroom (optional)
  created_at: Timestamp;      // Record creation
}
```

**Indexes Required**:
- `student_id` (Ascending) + `session_id` (Ascending) - **CRITICAL for duplicate check**
- `student_id` (Ascending) + `subject_id` (Ascending)
- `session_id` (Ascending) + `status` (Ascending)
- `subject_id` (Ascending) + `timestamp` (Descending)
- `student_id` (Ascending) + `timestamp` (Descending)

---

### 11. **attendance_stats** (Computed)

**Purpose**: Pre-calculated attendance statistics

**Document ID**: `{studentId}_{subjectId}` (composite key)

```typescript
{
  student_id: string;        // Reference to students
  subject_id: string;        // Reference to subjects
  total_classes: number;     // Total classes conducted
  present_count: number;     // Number of present marks
  absent_count: number;     // Number of absent marks
  late_count: number;       // Number of late marks
  percentage: number;        // Attendance percentage (0-100)
  last_updated: Timestamp;    // Last calculation time
}
```

**Indexes Required**:
- `student_id` (Ascending) + `subject_id` (Ascending)
- `student_id` (Ascending) + `percentage` (Ascending)

**Security**: Read-only for users, write-only by Cloud Functions

---

### 12. **notifications**

**Purpose**: User notifications (in-app and push)

**Document ID**: `{notificationId}` (auto-generated)

```typescript
{
  user_id: string;           // Target user UID
  type: "absence" | "late" | "low_attendance" | "system" | "session_start";
  title: string;             // Notification title
  message: string;            // Notification message
  student_id?: string;        // Related student (optional)
  session_id?: string;        // Related session (optional)
  read: boolean;             // Whether notification is read
  fcm_sent: boolean;          // Whether FCM push was sent
  created_at: Timestamp;      // Creation time
  read_at?: Timestamp;        // When read (optional)
}
```

**Indexes Required**:
- `user_id` (Ascending) + `read` (Ascending) + `created_at` (Descending)
- `user_id` (Ascending) + `created_at` (Descending)

---

### 13. **fcm_tokens** (Optional - for FCM management)

**Purpose**: Store FCM tokens for push notifications

**Document ID**: `{userId}` (Firebase Auth UID)

```typescript
{
  user_id: string;           // User UID
  tokens: string[];          // Array of FCM tokens (multiple devices)
  platform: "android" | "ios" | "web";
  last_updated: Timestamp;    // Last token update
}
```

**Indexes Required**: None

---

## 📊 Relationships

```
users (1) ──→ (1) user_roles
users (1) ──→ (1) profiles
users (1) ──→ (1) students (if role=student)
users (1) ──→ (1) faculty (if role=faculty)
users (1) ──→ (1) parents (if role=parent)

students (N) ──→ (1) classes
students (1) ──→ (1) parents

faculty (N) ──→ (N) subjects (many-to-many via subjects array)

lecture_sessions (1) ──→ (1) subjects
lecture_sessions (1) ──→ (1) classes
lecture_sessions (1) ──→ (1) faculty

attendance (N) ──→ (1) students
attendance (N) ──→ (1) lecture_sessions
attendance (N) ──→ (1) subjects
attendance (N) ──→ (1) faculty

attendance_stats (N) ──→ (1) students
attendance_stats (N) ──→ (1) subjects

notifications (N) ──→ (1) users
```

---

## 🔑 Key Design Decisions

1. **Composite Keys**: `attendance_stats` uses `{studentId}_{subjectId}` for efficient lookups
2. **Denormalization**: Store `subject_id` and `faculty_id` in attendance for fast queries
3. **Indexes**: Critical indexes for duplicate prevention and fast queries
4. **Timestamps**: Use server timestamps for consistency
5. **Optional Fields**: GPS and FCM fields are optional for flexibility

---

## 📝 Notes for Viva

- **Why separate `user_roles`?**: Allows role changes without affecting user profile
- **Why `attendance_stats`?**: Pre-calculated for fast reads, updated by Cloud Functions
- **Why store GPS in attendance?**: Audit trail and verification
- **Why composite key for stats?**: Efficient single-document lookup per student-subject pair
- **Why FCM tokens collection?**: Supports multiple devices per user

---

**Last Updated**: January 2025  
**Version**: 1.0.0

