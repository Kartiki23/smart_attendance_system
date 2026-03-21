const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Timetable = require("../models/Timetable");
const Attendance = require("../models/Attendance");
const Activity = require("../models/Activity");
const Parent = require("../models/Parent");


// =============================
// USER MANAGEMENT
// =============================

exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =============================
// CREATE USER
// =============================
exports.createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      rollNo,
      department,
      semester,
      employeeId,
      studentRollNumber,
      relation,
      contactNumber
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    if (role === "parent" && !studentRollNumber) {
      return res.status(400).json({
        success: false,
        message: "Student roll number is required for parent"
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role
    });

    let profile = null;

    if (role === "student") {
      const existingStudent = rollNo
        ? await Student.findOne({ rollNo })
        : null;

      if (existingStudent) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: "Student roll number already exists"
        });
      }

      profile = await Student.create({
        user: user._id,
        rollNo: rollNo || `STU${Date.now()}`,
        department: department || "General",
        semester: semester || 1
      });
    }

    if (role === "faculty") {
      const existingFaculty = employeeId
        ? await Faculty.findOne({ employeeId })
        : null;

      if (existingFaculty) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists"
        });
      }

      profile = await Faculty.create({
        user: user._id,
        employeeId: employeeId || `EMP${Date.now()}`,
        department: department || "General"
      });
    }

    if (role === "parent") {
      const linkedStudent = await Student.findOne({
        rollNo: studentRollNumber
      });

      if (!linkedStudent) {
        await User.findByIdAndDelete(user._id);
        return res.status(404).json({
          success: false,
          message: "Student not found with given roll number"
        });
      }

      const existingParent = await Parent.findOne({ user: user._id });
      if (existingParent) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: "Parent profile already exists"
        });
      }

      profile = await Parent.create({
        user: user._id,
        students: [linkedStudent._id],
        studentRollNumber,
        relation: relation || "Guardian",
        contactNumber: contactNumber || ""
      });
    }

    await Activity.create({
      action: `New ${role} created`,
      user: fullName
    });

    const createdUser = await User.findById(user._id).select("-password");

    return res.status(201).json({
      success: true,
      message: `${role} created successfully`,
      user: createdUser,
      profile
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// UPDATE ROLE
// =============================
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// DELETE USER
// =============================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await Student.deleteMany({ user: req.params.id });
    await Faculty.deleteMany({ user: req.params.id });
    await Parent.deleteMany({ user: req.params.id });

    await user.deleteOne();

    await Activity.create({
      action: "User deleted",
      user: user.fullName
    });

    res.json({
      success: true,
      message: "User deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// CLASSES
// =============================

exports.getAllClasses = async (req, res) => {

  try {

    const classes = await Class.find();

    res.json({
      success: true,
      classes
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


exports.createClass = async (req, res) => {

  try {

    const classData = await Class.create(req.body);

    res.json({
      success: true,
      class: classData
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


// =============================
// SUBJECTS
// =============================

exports.getAllSubjects = async (req, res) => {

  try {

    const subjects = await Subject.find();

    res.json({
      success: true,
      data:subjects
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error to fetching the subjects"
    });

  }

};


exports.createSubject = async (req, res) => {

  try {

    const subject = await Subject.create(req.body);

    res.json({
      success: true,
      subject
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


// =============================
// DASHBOARD STATS
// =============================

exports.getDashboardStats = async (req, res) => {

  try {

    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalClasses,
      totalSubjects,
      totalAttendance,
      presentAttendance
    ] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Faculty.countDocuments(),
      Class.countDocuments(),
      Subject.countDocuments(),
      Attendance.countDocuments(),
      Attendance.countDocuments({ status: "Present" })
    ]);

    const avgAttendance =
      totalAttendance === 0
        ? 0
        : ((presentAttendance / totalAttendance) * 100).toFixed(1);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalClasses,
        totalSubjects,
        avgAttendance
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



// =======================================
// ADMIN: Attendance Chart Data
// Route: GET /api/admin/attendance-chart
// =======================================

exports.getAttendanceChart = async (req, res) => {
  try {
    const attendanceData = await Attendance.aggregate([
      {
        $project: {
          normalizedStatus: {
            $toLower: {
              $ifNull: ["$status", "present"]
            }
          }
        }
      },
      {
        $group: {
          _id: "$normalizedStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    let chart = {
      present: 0,
      absent: 0,
      late: 0
    };

    attendanceData.forEach((item) => {
      if (item._id === "present") {
        chart.present = item.count;
      }

      if (item._id === "absent") {
        chart.absent = item.count;
      }

      if (item._id === "late") {
        chart.late = item.count;
      }
    });

    const chartData = [
      { name: "Present", attendance: chart.present },
      { name: "Absent", attendance: chart.absent },
      { name: "Late", attendance: chart.late }
    ];

    res.json({
      success: true,
      chart,
      chartData
    });
  } catch (error) {
    console.error("Attendance Chart Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance chart"
    });
  }
};
// =============================
// TIMETABLE
// =============================

exports.getFullTimetable = async (req, res) => {

  try {

    const timetable = await Timetable.find()
      .populate("class", "name")
      .populate("subject", "name")
      .populate({
        path: "teacher",
        select: "employeeId user",
        populate: { path: "user", select: "fullName" }
      })
      .sort({ day: 1, startTime: 1 });

    const formatted = timetable.map((t) => ({
      className: t.class?.name,
      subjectName: t.subject?.name,
      facultyName: t.teacher?.user?.fullName || "Unassigned",
      day: t.day,
      startTime: t.startTime,
      endTime: t.endTime
    }));

    res.json({
      success: true,
      timetable: formatted
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


// =============================
// RECENT ACTIVITIES
// =============================
exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const formatted = activities.map((a) => ({
      action: a.action,
      user: a.user,
      role: a.role,
      time: new Date(a.createdAt).toLocaleString()
    }));

    res.json({
      success: true,
      activities: formatted
    });
  } catch (error) {
    console.error("Recent Activities Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Subject on admin dashboard
exports.getAllTimetableAdmin = async (req, res) => {
  try {

    const timetable = await Timetable.find()
      .populate("subject", "name code")
      .populate("class", "name")
      .populate({
        path: "teacher",
        populate: {
          path: "user",
          select: "fullName"
        }
      });

    // ✅ FIX DAY ORDER
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    timetable.sort((a, b) => {
      return (
        dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
      );
    });

    res.json({
      success: true,
      data: timetable
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching timetable"
    });
  }
};

//update data of timetable 
exports.updateTimetable = async (req, res) => {
  try {
    const { subject, teacher } = req.body;

    const updated = await Timetable.findByIdAndUpdate(
      req.params.id,
      {
        subject,
        teacher: teacher || null // ✅ IMPORTANT
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found"
      });
    }

    res.json({
      success: true,
      data: updated
    });

  } catch (err) {
    console.error("Update Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// controllers/adminController.js

exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().populate("user", "fullName");

    res.json({
      success: true,
      data: faculty
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching faculty"
    });
  }
};


// const Attendance = require("../models/Attendance");
// const Student = require("../models/Student");
// const Subject = require("../models/Subject");
// const Class = require("../models/Class");
// const Faculty = require("../models/Faculty");
// const User = require("../models/User");
// const Activity = require("../models/Activity");

// ==============================
// ADMIN ATTENDANCE SUMMARY
// ==============================
exports.getAdminAttendanceSummary = async (req, res) => {
  try {
    const { department = "all", classId = "all", subjectId = "all" } = req.query;

    const attendanceQuery = {};

    if (classId !== "all") {
      attendanceQuery.class = classId;
    }

    if (subjectId !== "all") {
      attendanceQuery.subject = subjectId;
    }

    const attendanceRecords = await Attendance.find(attendanceQuery)
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "fullName email"
        }
      })
      .populate({
        path: "class",
        select: "name department semester"
      })
      .populate({
        path: "subject",
        select: "name code department semester"
      })
      .sort({ createdAt: -1 });

    let filteredRecords = attendanceRecords;

    if (department !== "all") {
      filteredRecords = attendanceRecords.filter((record) => {
        const classDepartment = record.class?.department || "";
        const subjectDepartment = record.subject?.department || "";
        return classDepartment === department || subjectDepartment === department;
      });
    }

    const groupedMap = new Map();

    filteredRecords.forEach((record) => {
      if (!record.student || !record.subject) return;

      const studentId = record.student._id.toString();
      const subjectKey = record.subject._id.toString();
      const key = `${studentId}-${subjectKey}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          studentId: record.student._id,
          studentName: record.student?.user?.fullName || "Unknown Student",
          email: record.student?.user?.email || "N/A",
          rollNo: record.student?.rollNo || "N/A",
          department:
            record.class?.department ||
            record.subject?.department ||
            "N/A",
          className: record.class?.name || "N/A",
          semester:
            record.class?.semester ||
            record.subject?.semester ||
            "N/A",
          subjectId: record.subject._id,
          subjectName: record.subject?.name || "Unknown Subject",
          subjectCode: record.subject?.code || "N/A",
          totalClasses: 0,
          attendedClasses: 0,
          missedClasses: 0,
          percentage: 0
        });
      }

      const summary = groupedMap.get(key);
      summary.totalClasses += 1;

      if (
        record.status === "Present" ||
        record.status === "present" ||
        record.isQRMarked === true
      ) {
        summary.attendedClasses += 1;
      } else {
        summary.missedClasses += 1;
      }

      summary.percentage = summary.totalClasses
        ? Math.round((summary.attendedClasses / summary.totalClasses) * 100)
        : 0;
    });

    const summaryData = Array.from(groupedMap.values());

    const classes = await Class.find().select("name department semester");
    const subjects = await Subject.find().select("name code department semester");

    const departments = [
      ...new Set(
        [
          ...classes.map((cls) => cls.department).filter(Boolean),
          ...subjects.map((sub) => sub.department).filter(Boolean)
        ]
      )
    ];

    res.status(200).json({
      success: true,
      data: summaryData,
      filters: {
        departments,
        classes,
        subjects
      }
    });
  } catch (error) {
    console.error("getAdminAttendanceSummary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance summary",
      error: error.message
    });
  }
};