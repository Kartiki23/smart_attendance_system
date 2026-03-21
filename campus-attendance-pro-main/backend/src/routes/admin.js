const express = require("express");
const multer = require("multer");

const {
  createUser,
  getAllUsers,
  updateUserRole,
  deleteUser,

  getAllClasses,
  createClass,

  getAllSubjects,
  createSubject,

  getDashboardStats,
  getAttendanceChart,
  getRecentActivities,

  getFullTimetable,
  getAllTimetableAdmin,
  updateTimetable,
  getAllFaculty,
  getAdminAttendanceSummary

} = require("../controllers/adminController");

const { uploadTimetable } = require("../controllers/timetableController");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();


// ===============================
// Multer Configuration
// ===============================

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024   // 5MB limit
  }
});


// ===============================
// Security Middleware
// ===============================

router.use(protect);
router.use(authorize("admin"));


// =======================================================
// USER MANAGEMENT
// =======================================================

// Create new user (student/faculty/admin)
router.post("/users", createUser);

// Get all users
router.get("/users", getAllUsers);

// Update user role
router.put("/users/:id/role", updateUserRole);

// Delete user
router.delete("/users/:id", deleteUser);



// =======================================================
// CLASS MANAGEMENT
// =======================================================

// Get all classes
router.get("/classes", getAllClasses);

// Create new class
router.post("/classes", createClass);



// =======================================================
// SUBJECT MANAGEMENT
// =======================================================

// Get all subjects
router.get("/subjects", getAllSubjects);

// Create subject
router.post("/subjects", createSubject);



// =======================================================
// ADMIN DASHBOARD
// =======================================================

// Dashboard statistics
router.get("/stats", getDashboardStats);

// Attendance chart data
router.get("/attendance-chart", getAttendanceChart);

// Recent activities
router.get("/recent-activities",authorize("admin"), getRecentActivities);



// =======================================================
// TIMETABLE MANAGEMENT
// =======================================================

// Upload timetable Excel
router.post(
  "/timetable/upload",
  upload.single("file"),
  uploadTimetable
);

// Get full timetable
router.get("/timetable", getFullTimetable);

// Get subject 
router.get("/gettimetable", protect, getAllTimetableAdmin);

// update timetable 
router.put("/:id", authorize("admin"), updateTimetable);

router.get("/faculty",getAllFaculty)

router.get("/attendance-summary",protect,getAdminAttendanceSummary)

// ===============================
// Export Router
// ===============================

module.exports = router;