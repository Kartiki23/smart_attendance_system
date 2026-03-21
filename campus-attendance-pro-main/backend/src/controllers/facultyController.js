const Subject = require("../models/Subject");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Timetable = require("../models/Timetable");
const Faculty = require("../models/Faculty");


// =====================================================
// Get all subjects assigned to logged-in faculty
// =====================================================
exports.getFacultyDashboard = async (req, res) => {
  try {

    // Step 1: Find faculty record using logged-in user id
    const faculty = await Faculty.findOne({ user: req.user.id });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found"
      });
    }

    // Step 2: Get timetable for that faculty
    const subjects = await Timetable.find({ teacher: faculty._id })
      .populate("class")
      .populate("subject")
      .sort({ day: 1, startTime: 1 });

    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });

  } catch (error) {
    console.error("Faculty dashboard error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// =====================================================
// Get all students + attendance summary for subject
// =====================================================
// const Attendance = require("../models/Attendance");
// const Student = require("../models/Student");
// const Subject = require("../models/Subject");
// const Class = require("../models/Class");

exports.getSubjectReport = async (req, res) => {
  try {
    const { subjectId, classId } = req.params;

    // Validate ids
    if (!subjectId || !classId) {
      return res.status(400).json({
        success: false,
        message: "Subject ID and Class ID are required",
      });
    }

    // Get all attendance entries for this class + subject
    const attendanceRecords = await Attendance.find({
      subject: subjectId,
      class: classId,
    })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "fullName",
        },
      })
      .populate("subject", "name code")
      .populate("class", "name department semester");

    // If no attendance yet
    if (!attendanceRecords.length) {
      return res.json({
        success: true,
        data: [],
        summary: {
          totalStudents: 0,
          subjectName: "",
          className: "",
        },
      });
    }

    // Group by student
    const studentMap = new Map();

    attendanceRecords.forEach((record) => {
      const student = record.student;
      if (!student) return;

      const studentId = student._id.toString();

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId: student._id,
          name: student.user?.fullName || "Unknown",
          rollNo: student.rollNo || "-",
          year: student.semester || 1,
          totalLectures: 0,
          attendedLectures: 0,
          percentage: 0,
        });
      }

      const item = studentMap.get(studentId);
      item.totalLectures += 1;

      const status = String(record.status || "").toLowerCase();
      if (status === "present") {
        item.attendedLectures += 1;
      }
    });

    const stats = Array.from(studentMap.values()).map((student) => ({
      ...student,
      percentage:
        student.totalLectures > 0
          ? Math.round((student.attendedLectures / student.totalLectures) * 100)
          : 0,
    }));

    // Sort by roll number / name
    stats.sort((a, b) => {
      if (a.rollNo && b.rollNo) {
        return String(a.rollNo).localeCompare(String(b.rollNo), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }
      return String(a.name).localeCompare(String(b.name));
    });

    const first = attendanceRecords[0];

    res.json({
      success: true,
      data: stats,
      summary: {
        totalStudents: stats.length,
        subjectName: first.subject?.name || "",
        className: first.class?.name || "",
      },
    });
  } catch (error) {
    console.error("Subject report error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Get faculty profile
// =====================================================
exports.getFacultyProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id }).populate('user', 'fullName email avatar_url');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }
    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// Update faculty profile
// =====================================================
exports.updateFacultyProfile = async (req, res) => {
  try {
    // Allows updating department or employeeId specifically
    const faculty = await Faculty.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'fullName email');

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }
    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET /faculty/today-subjects/:facultyId

// const Faculty = require("../models/Faculty");
// const Timetable = require("../models/Timetable");

exports.getTodaySubjects = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found",
      });
    }

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const today = days[new Date().getDay()];

    const data = await Timetable.find({
      teacher: faculty._id,
      day: today,
    })
      .populate("subject", "name code")
      .populate("class", "name department semester")
      .populate({
        path: "teacher",
        populate: {
          path: "user",
          select: "fullName email",
        },
      })
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      day: today,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("getTodaySubjects error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};