const Parent = require("../models/Parent");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

// =============================
// GET LINKED STUDENT DATA
// =============================
exports.getStudentData = async (req, res) => {
  try {
    const parentUserId = req.user.id;

    const parent = await Parent.findOne({ user: parentUserId }).populate({
      path: "students",
      populate: [
        { path: "user", select: "fullName email" },
        { path: "class", select: "name department semester" }
      ]
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found"
      });
    }

    if (!parent.students || parent.students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No student linked to this parent"
      });
    }

    return res.status(200).json({
      success: true,
      data: parent.students[0]
    });
  } catch (error) {
    console.error("getStudentData error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// ATTENDANCE SUMMARY
// =============================
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    const total = await Attendance.countDocuments({ student: studentId });
    const present = await Attendance.countDocuments({
      student: studentId,
      status: "Present"
    });
    const absent = await Attendance.countDocuments({
      student: studentId,
      status: "Absent"
    });

    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        present,
        absent,
        percentage
      }
    });
  } catch (error) {
    console.error("getAttendanceSummary error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// RECENT ATTENDANCE
// =============================
exports.getRecentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const data = await Attendance.find({ student: studentId })
      .populate("subject", "name code")
      .populate({
        path: "teacher",
        populate: {
          path: "user",
          select: "fullName"
        }
      })
      .sort({ date: -1, createdAt: -1 })
      .limit(8);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("getRecentAttendance error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// CHART DATA
// =============================
exports.getAttendanceChart = async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await Attendance.find({ student: studentId })
      .sort({ date: 1, createdAt: 1 });

    const grouped = {};

    records.forEach((item) => {
      const day = new Date(item.date || item.createdAt).toLocaleDateString("en-IN");
      if (!grouped[day]) {
        grouped[day] = { total: 0, present: 0 };
      }

      grouped[day].total += 1;
      if (item.status === "Present") {
        grouped[day].present += 1;
      }
    });

    const data = Object.keys(grouped).map((day) => ({
      name: day,
      attendance:
        grouped[day].total > 0
          ? Math.round((grouped[day].present / grouped[day].total) * 100)
          : 0
    }));

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("getAttendanceChart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// =============================
// NOTIFICATIONS
// =============================
exports.getNotifications = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: [
        {
          message: "Attendance dashboard loaded successfully",
          time: new Date().toLocaleString()
        }
      ]
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};