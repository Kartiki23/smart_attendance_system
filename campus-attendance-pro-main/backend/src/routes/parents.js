const express = require("express");
const router = express.Router();

const {
  getStudentData,
  getAttendanceSummary,
  getRecentAttendance,
  getAttendanceChart,
  getNotifications
} = require("../controllers/parentController");

const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("parent"));

router.get("/student", getStudentData);
router.get("/attendance-summary/:studentId", getAttendanceSummary);
router.get("/recent-attendance/:studentId", getRecentAttendance);
router.get("/chart/:studentId", getAttendanceChart);
router.get("/notifications", getNotifications);

module.exports = router;