const express = require("express");

const {
  getDailySchedule,
  getTimetableByClass,
  updateTimetableEntry,
  deleteTimetableEntry,
  uploadTimetable
} = require("../controllers/timetableController");

const {
  protect,
  authorize
} = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

// All timetable routes require login
router.use(protect);

router.get("/daily", authorize("student", "faculty"), getDailySchedule);
router.get("/class/:classId", authorize("admin", "faculty", "student", "parent"), getTimetableByClass);
router.put("/:id", authorize("admin"), updateTimetableEntry);
router.delete("/:id", authorize("admin"), deleteTimetableEntry);
router.post("/upload", upload.single("file"), uploadTimetable);

module.exports = router;
