const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const Timetable = require("../models/Timetable");
const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const logActivity = require("../utils/logActivity");
const Faculty = require("../models/Faculty");
const Parent = require("../models/Parent");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const { io, users } = require("../server");
// =============================================
// Generate QR (Faculty) - AUTO LECTURE DETECTION
// ============================================
exports.generateQR = async (req, res) => {
  try {
    const facultyUserId = req.user.id;
    const now = new Date();

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const today = days[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const faculty = await Faculty.findOne({ user: facultyUserId }).populate(
      "user",
      "fullName email"
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const lectures = await Timetable.find({
      teacher: faculty._id,
      day: today,
    })
      .populate("subject")
      .populate("class");

    if (!lectures || lectures.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No lectures scheduled for today",
      });
    }

    lectures.sort((a, b) => a.startTime.localeCompare(b.startTime));

    let currentLecture = null;
    let nextLecture = null;

    for (const lecture of lectures) {
      const [sh, sm] = lecture.startTime.split(":").map(Number);
      const [eh, em] = lecture.endTime.split(":").map(Number);

      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      if (currentMinutes >= start && currentMinutes <= end) {
        currentLecture = lecture;
        break;
      }

      if (currentMinutes < start && !nextLecture) {
        nextLecture = lecture;
      }
    }

    if (!currentLecture) {
      return res.status(200).json({
        success: false,
        message: "No active lecture right now",
        nextLecture: nextLecture
          ? {
              subject: nextLecture.subject?.name || "N/A",
              class: nextLecture.class?.name || "N/A",
              startTime: nextLecture.startTime,
              endTime: nextLecture.endTime,
            }
          : null,
      });
    }

    await AttendanceSession.updateMany(
      {
        teacher: faculty._id,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
        },
      }
    );

    const sessionToken = uuidv4();

    const session = await AttendanceSession.create({
      sessionToken,
      subject: currentLecture.subject._id,
      class: currentLecture.class._id,
      teacher: faculty._id,
      timetable: currentLecture._id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isActive: true,
    });

    const qrPayload = {
      sessionToken,
      subjectId: currentLecture.subject._id,
      classId: currentLecture.class._id,
      teacherId: faculty._id,
      timetableId: currentLecture._id,
      generatedAt: new Date().toISOString(),
    };

    const qrImage = await QRCode.toDataURL(JSON.stringify(qrPayload));

    await logActivity({
      action: `QR generated for ${currentLecture.subject.name} (${currentLecture.class.name})`,
      user: faculty.user?.fullName || "Faculty",
      role: "faculty",
      meta: {
        facultyId: faculty._id,
        facultyUserId: facultyUserId,
        sessionId: session._id,
        subjectId: currentLecture.subject._id,
        classId: currentLecture.class._id,
        timetableId: currentLecture._id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Unique QR generated successfully",
      qrImage,
      sessionToken,
      subject: currentLecture.subject.name,
      class: currentLecture.class.name,
      startTime: currentLecture.startTime,
      endTime: currentLecture.endTime,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("Generate QR error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate QR",
    });
  }
};

// =============================
// MARK ATTENDANCE (QR SCAN)
// =============================
exports.markScannerAttendance = async (req, res) => {
  try {

    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        message: "Session token required"
      });
    }

    // 🔍 Find session
    const session = await AttendanceSession.findOne({
      sessionToken,
      isActive: true
    })
      .populate("subject", "name")
      .populate("teacher")
      .populate("class", "name");

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR / Session"
      });
    }

    // ⛔ Session expired → mark absentees
    if (new Date() > session.expiresAt) {

      session.isActive = false;
      await session.save();

      await markAbsentStudents(session);

      return res.status(400).json({
        success: false,
        message: "Session expired"
      });
    }

    // 👤 Get student
    const student = await Student.findOne({
      user: req.user.id
    })
      .populate("user", "fullName email")
      .populate("class", "name");

    // 🚫 Class mismatch
    if (student.class.toString() !== session.class.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not in this class"
      });
    }

    // 🔁 Duplicate check
    const exists = await Attendance.findOne({
      student: student._id,
      sessionToken
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Already marked"
      });
    }

    // ✅ MARK PRESENT
    await Attendance.create({
      student: student._id,
      class: session.class,
      subject: session.subject,
      teacher: session.teacher,
      sessionToken,
      isQRMarked: true,
      status: "Present"
    });

    // =========================
    // 🔔 NOTIFICATIONS (PRESENT)
    // =========================

    const parent = await Parent.findOne({
      students: student._id
    }).populate("user");

    const message = `${student.user.fullName} is present in ${session.subject.name}`;

    // 📱 Student notification
    await Notification.create({
      user: student.user._id,
      message,
      type: "attendance"
    });

    // 📱 Parent notification
    if (parent) {

      await Notification.create({
        user: parent.user._id,
        message,
        type: "attendance"
      });

      // 🔴 REAL-TIME PUSH TO PARENT
      const socketId = users[parent.user._id];

      if (socketId) {
        io.to(socketId).emit("newNotification", {
          message,
          time: new Date()
        });
      }
    }

    // 📊 Activity log
    await logActivity({
      action: `Attendance marked for ${session.subject?.name}`,
      user: student.user?.fullName,
      role: "student"
    });

    res.json({
      success: true,
      message: "Attendance marked successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// =============================
// AUTO MARK ABSENT STUDENTS
// =============================
const markAbsentStudents = async (session) => {
  try {

    // 👥 Get all class students
    const students = await Student.find({
      class: session.class
    }).populate("user", "fullName email");

    for (let student of students) {

      // 🔍 Already marked?
      const exists = await Attendance.findOne({
        student: student._id,
        sessionToken: session.sessionToken
      });

      if (!exists) {

        // ❌ MARK ABSENT
        await Attendance.create({
          student: student._id,
          class: session.class,
          subject: session.subject,
          teacher: session.teacher,
          sessionToken: session.sessionToken,
          status: "Absent"
        });

        const message = `You were absent in ${session.subject.name}`;

        // 📱 Student notification
        await Notification.create({
          user: student.user._id,
          message,
          type: "alert"
        });

        // 🔴 REAL-TIME STUDENT PUSH
        const studentSocket = users[student.user._id];
        if (studentSocket) {
          io.to(studentSocket).emit("newNotification", {
            message,
            time: new Date()
          });
        }

        // 👪 Parent notification
        const parent = await Parent.findOne({
          students: student._id
        }).populate("user");

        if (parent) {

          const parentMessage = `Your child ${student.user.fullName} was absent in ${session.subject.name}`;

          await Notification.create({
            user: parent.user._id,
            message: parentMessage,
            type: "alert"
          });

          // 🔴 REAL-TIME PARENT PUSH
          const parentSocket = users[parent.user._id];

          if (parentSocket) {
            io.to(parentSocket).emit("newNotification", {
              message: parentMessage,
              time: new Date()
            });
          }

          // 📧 EMAIL ALERT
          if (parent.user.email) {
            await sendEmail(
              parent.user.email,
              "Attendance Alert",
              parentMessage
            );
          }
        }
      }
    }

    console.log("✅ Absent students marked");

  } catch (error) {
    console.error("❌ Absent marking error:", error.message);
  }
};

// =============================================
// Manual Attendance
// =============================================
exports.markAttendance = async (req, res) => {

  try {

    const { subjectId } = req.body;

    const student = await Student.findOne({
      user: req.user.id
    });

    const attendance = await Attendance.create({
      student: student._id,
      subject: subjectId,
      teacher: req.user.id,
      status: "Present"
    });

    res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



// =============================================
// Student Attendance History
// =============================================
exports.getAttendanceHistory = async (req, res) => {

  try {

    const student = await Student.findOne({
      user: req.user.id
    });

    const attendance = await Attendance.find({
      student: student._id
    })
      .populate("subject", "name code")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



// =============================================
// Student Subject Stats
// =============================================

exports.getStudentSubjectStats = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate(
      "class",
      "name department semester"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!student.class) {
      return res.status(400).json({
        success: false,
        message: "Student class not assigned"
      });
    }

    // ✅ Get all timetable entries for student's class
    const timetableEntries = await Timetable.find({
      class: student.class._id
    })
      .populate("subject", "name code")
      .populate({
        path: "teacher",
        populate: {
          path: "user",
          select: "fullName"
        }
      });

    // ✅ Get attendance records of this student
    const attendanceRecords = await Attendance.find({
      student: student._id
    }).populate("subject", "name code");

    const statsMap = {};

    // ✅ Add subjects from timetable first
    timetableEntries.forEach((entry) => {
      if (!entry.subject) return;

      const subjectId = entry.subject._id.toString();

      if (!statsMap[subjectId]) {
        statsMap[subjectId] = {
          id: subjectId,
          name: entry.subject.name || "Unknown Subject",
          code: entry.subject.code || "",
          teacher: entry.teacher?.user?.fullName || "Unknown Teacher",
          totalLectures: 0,
          presentCount: 0,
          percentage: 0
        };
      }
    });

    // ✅ Count attendance per subject
    attendanceRecords.forEach((record) => {
      if (!record.subject) return;

      const subjectId = record.subject._id.toString();

      // if subject not already added from timetable
      if (!statsMap[subjectId]) {
        statsMap[subjectId] = {
          id: subjectId,
          name: record.subject.name || "Unknown Subject",
          code: record.subject.code || "",
          teacher: "Unknown Teacher",
          totalLectures: 0,
          presentCount: 0,
          percentage: 0
        };
      }

      statsMap[subjectId].totalLectures += 1;

      if (record.status === "Present" || record.isQRMarked === true) {
        statsMap[subjectId].presentCount += 1;
      }
    });

    const result = Object.values(statsMap).map((subject) => ({
      ...subject,
      percentage:
        subject.totalLectures > 0
          ? Math.round((subject.presentCount / subject.totalLectures) * 100)
          : 0
    }));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("getStudentSubjectStats error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =============================================
// Faculty Subjects
// =============================================

exports.getFacultySubjects = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const data = await Timetable.find({ teacher: facultyId })
      .populate("subject")
      .populate({
        path: "teacher",
        populate: { path: "user", select: "fullName" }
      });

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// =============================================
// Faculty Attendance History
// =============================================
exports.getFacultySessionHistory = async (req, res) => {

  try {

    const attendance = await Attendance.find({
      teacher: req.user.id
    })
      .populate("student")
      .populate("subject");

    res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



// =============================================
// Faculty Class Attendance
// =============================================
exports.getClassAttendanceForFaculty = async (req, res) => {

  try {

    const { subjectId, classId } = req.params;

    const attendance = await Attendance.find({
      subject: subjectId,
      class: classId
    })
      .populate("student")
      .populate("subject");

    res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};



// =============================================
// Faculty View All Attendance
// =============================================
exports.getSessionAttendance = async (req, res) => {

  try {

    const attendance = await Attendance.find({
      teacher: req.user.id
    })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "fullName"
        }
      })
      .populate("subject", "name code");

    res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


exports.getActiveSession = async (req, res) => {
  try {

    const session = await AttendanceSession.findOne({
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
      .populate("subject")
      .populate("class");

    if (!session) {
      return res.json({
        success: false,
        message: "No active lecture"
      });
    }

    res.json({
      success: true,
      session: {
        sessionToken: session.sessionToken,
        subject: session.subject.name,
        class: session.class.name
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /attendance/faculty
exports.getFacultyAttendance = async (req, res) => {  
  try {  

    const facultyId = req.user.id;  

    const attendance = await Attendance.find({  
      teacher: facultyId  
    })  
      .populate({   // 🔥 FIXED
        path: "student",
        populate: {
          path: "user",
          select: "fullName"
        }
      })
      .populate("subject", "name")  
      .populate("class", "name")  
      .sort({ createdAt: -1 });  
    
      console.log("Attendance Found:",attendance.length);
    res.json({  
      success: true,  
      attendance  
    });  

  } catch (error) {  
    res.status(500).json({  
      success: false,  
      message: error.message  
    });  
  }  
};

// GET /attendance/student
exports.getStudentAttendance = async (req, res) => {
  try {

    const student = await Student.findOne({
      user: req.user.id
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const attendance = await Attendance.find({
      student: student._id
    })
      .populate("subject", "name")
      .populate("class", "name")
      .populate("teacher", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      attendance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};