const express = require("express");

const {
  markAttendance,
  getAttendanceHistory,
  getStudentSubjectStats,
  getFacultySubjects,
  getFacultySessionHistory,
  getClassAttendanceForFaculty,
  generateQR,
  markScannerAttendance,
  getSessionAttendance,
  getActiveSession,
  getFacultyAttendance,
  getStudentAttendance
} = require("../controllers/attendanceController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();


// ==========================================
// All routes require authentication
// ==========================================
router.use(protect);


// ==========================================
// STUDENT ROUTES
// ==========================================

// Manual attendance (if needed)
router.post(
  "/mark",
  authorize("student"),
  markAttendance
);

// Student attendance history
router.get(
  "/history",
  authorize("student"),
  getAttendanceHistory
);

// Student subject attendance stats
router.get(
  "/stats",
  authorize("student", "parent"),
  getStudentSubjectStats
);


// ==========================================
// FACULTY ROUTES
// ==========================================

// Generate QR for attendance
router.post(
  "/generate-qr",
  authorize("faculty"),
  generateQR
);

// Faculty subjects list
router.get(
  "/faculty-subject/:facultyId",
  authorize("faculty"),
  getFacultySubjects
);

// Faculty attendance history
router.get(
  "/faculty/history",
  authorize("faculty"),
  getFacultySessionHistory
);

// Faculty view class attendance
router.get(
  "/faculty/subject/:subjectId/class/:classId",
  authorize("faculty"),
  getClassAttendanceForFaculty
);

// Faculty view all QR session attendance
router.get(
  "/faculty/attendance",
  authorize("faculty"),
  getSessionAttendance
);


// ==========================================
// QR SCAN ROUTE
// ==========================================

// Student scans QR
router.post(
  "/scan",
  authorize("student"),
  markScannerAttendance
);

router.get("/active-session", authorize("student"), getActiveSession);

// ✅ Faculty attendance (MAIN DASHBOARD API 🔥)
router.get(
  "/faculty-attendance",
  authorize("faculty"),
  getFacultyAttendance
);

// ✅ Student attendance list (dashboard)
router.get(
  "/student-attendance",
  authorize('student'),
  getStudentAttendance 
);
module.exports = router;