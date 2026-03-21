const express = require('express');
const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');
const { getStudentDashboard } = require("../controllers/studentController");

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Require authentication for all student routes
router.use(protect);

router.get("/dashboard", authorize("student"), getStudentDashboard);

router.route('/')
    .get(authorize('admin', 'faculty'), getAllStudents)
    .post(authorize('admin'), createStudent);


router.route('/:id')
    .get(authorize('admin', 'faculty', 'student', 'parent'), getStudentById)
    .put(authorize('admin'), updateStudent)
    .delete(authorize('admin'), deleteStudent);

module.exports = router;
