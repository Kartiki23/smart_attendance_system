const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const User = require("../models/User");

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Faculty)
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate('user', 'fullName email')
            .populate('class', 'name department semester')
            .populate('parentId', 'fullName email');

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('user', 'fullName email')
            .populate('class', 'name department semester')
            .populate('parentId', 'fullName email');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create student (Typically done via Auth Register, but available for Admin)
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res) => {
    try {
        // Assume user is already created, and we are just mapping them
        const { user, rollNo, department, semester, class: classId, parentId } = req.body;
        
        const existingStudent = await Student.findOne({ rollNo });
        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'Roll number already exists' });
        }

        const student = await Student.create({
            user, rollNo, department, semester, class: classId, parentId
        });

        res.status(201).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        await student.deleteOne();
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// const Student = require("../models/Student");
// const Attendance = require("../models/Attendance");

exports.getStudentDashboard = async (req, res) => {
  try {
    // ✅ Find student correctly
    const student = await Student.findOne({ user: req.user.id })
      .populate("user", "fullName email")
      .populate("class", "name department semester");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // ✅ Get attendance
    const attendance = await Attendance.find({ student: student._id })
      .populate("subject", "name code")
      .sort({ createdAt: -1 });

    const total = attendance.length;

    const present = attendance.filter(
      (a) => a.status === "Present" || a.isQRMarked === true
    ).length;

    const absent = total - present;

    const percentage =
      total === 0 ? 0 : Math.round((present / total) * 100);

    res.status(200).json({
      success: true,
      data: {
        student,
        attendance,
        stats: {
          total,
          present,
          absent,
          percentage
        }
      }
    });
  } catch (error) {
    console.error("Dashboard ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Dashboard failed",
      error: error.message
    });
  }
};