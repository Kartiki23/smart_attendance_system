const express = require("express");
const router = express.Router();
const facultyController = require("../controllers/facultyController");
const auth = require("../middleware/auth");

// All faculty routes protected
router.get(
  "/dashboard",
  auth.protect,
  auth.authorize("faculty"),
  facultyController.getFacultyDashboard
);

router.get(
  "/report/:subjectId/:classId",
  auth.protect,
  auth.authorize("faculty"),
  facultyController.getSubjectReport
);

router.get(
  "/profile",
  auth.protect,
  auth.authorize("faculty"),
  facultyController.getFacultyProfile
);

router.put(
  "/profile",
  auth.protect,
  auth.authorize("faculty"),
  facultyController.updateFacultyProfile
);

router.get("/today-subjects",auth.protect,facultyController.getTodaySubjects)

module.exports = router;