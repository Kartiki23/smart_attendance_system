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
const moment = require("moment-timezone");
// =============================================
// Generate QR (Faculty) - AUTO LECTURE DETECTION
// ============================================

// const moment = require("moment-timezone");
// const { v4: uuidv4 } = require("uuid");
// const QRCode = require("qrcode");

exports.generateQR = async (req, res) => {
  try {
    const facultyUserId = req.user.id;

    // Current IST time
    const now = moment().tz("Asia/Kolkata");
    const today = now.format("dddd");

    console.log("🕒 IST Time:", now.format("HH:mm"));
    console.log("📅 Today:", today);

    const faculty = await Faculty.findOne({ user: facultyUserId })
      .populate("user", "fullName email");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const lectures = await Timetable.find({
      teacher: faculty._id,
      day: { $regex: `^${today}$`, $options: "i" },
    })
      .populate("subject")
      .populate("class");

    console.log("📚 Lectures Found:", lectures.length);

    if (!lectures.length) {
      return res.status(404).json({
        success: false,
        message: "No lectures scheduled for today",
      });
    }

    // ✅ SAFE TIME PARSER (handles 12hr + 24hr)
    const parseTime = (timeStr) => {
      let time;

      if (timeStr.includes("AM") || timeStr.includes("PM")) {
        time = moment.tz(timeStr, "hh:mm A", "Asia/Kolkata");
      } else {
        time = moment.tz(timeStr, "HH:mm", "Asia/Kolkata");
      }

      return time.hours() * 60 + time.minutes();
    };

    // ✅ SORT CORRECTLY (using minutes)
    lectures.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

    let currentLecture = null;
    let nextLecture = null;

    const currentMinutes = now.hours() * 60 + now.minutes();

    for (const lecture of lectures) {

      const startMinutes = parseTime(lecture.startTime);
      const endMinutes = parseTime(lecture.endTime);

      console.log(
        `Lecture: ${lecture.subject?.name} | ${lecture.startTime}-${lecture.endTime} | Start: ${startMinutes}, End: ${endMinutes}, Current: ${currentMinutes}`
      );

      // ✅ ACTIVE LECTURE CHECK
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        currentLecture = lecture;
        console.log("✅ Current lecture found");
        break;
      }

      // ✅ NEXT LECTURE
      if (currentMinutes < startMinutes && !nextLecture) {
        nextLecture = lecture;
      }
    }

    // ❌ NO ACTIVE LECTURE
    if (!currentLecture) {
      return res.status(200).json({
        success: false,
        message: "No active lecture right now",
        // nextLecture: nextLecture
        //   ? {
        //       subject: nextLecture.subject?.name || "N/A",
        //       class: nextLecture.class?.name || "N/A",
        //       startTime: nextLecture.startTime,
        //       endTime: nextLecture.endTime,
        //       // batch: nextLecture.batch,
        //       type: nextLecture.type
        //     }
        //   : null,
      });
    }

    // ✅ CLOSE OLD SESSIONS
    await AttendanceSession.updateMany(
      { teacher: faculty._id, isActive: true },
      { $set: { isActive: false } }
    );

    const sessionToken = uuidv4();

    // ✅ CREATE SESSION
    const session = await AttendanceSession.create({
      sessionToken,
      subject: currentLecture.subject._id,
      class: currentLecture.class._id,
      teacher: faculty._id,
      timetable: currentLecture._id,
      // batch: currentLecture.batch || "All",
      type: currentLecture.type || "theory",
      expiresAt: new Date(Date.now() + 1 * 60 * 1000),
      isActive: true,
    });

    // ✅ QR PAYLOAD
    const qrPayload = {
      sessionToken,
      subjectId: currentLecture.subject._id,
      classId: currentLecture.class._id,
      teacherId: faculty._id,
      timetableId: currentLecture._id,
      // batch: currentLecture.batch || "All",
      type: currentLecture.type || "theory",
      generatedAt: new Date().toISOString(),
    };

    const qrImage = await QRCode.toDataURL(JSON.stringify(qrPayload));

    return res.status(200).json({
      success: true,
      message: "QR generated successfully",
      qrImage,
      subject: currentLecture.subject.name,
      class: currentLecture.class.name,
      startTime: currentLecture.startTime,
      endTime: currentLecture.endTime,
      // batch: currentLecture.batch,
      type: currentLecture.type,
      expiresAt: session.expiresAt,
    });

  } catch (error) {
    console.error("Generate QR error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =================================================
// MARK ATTENDANCE USING QR
// =================================================
exports.markScannerAttendance = async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ success: false, message: "Session token required" });
    }

    // ⏳ FIND ACTIVE SESSION
    const session = await AttendanceSession.findOne({
      sessionToken,
      isActive: true
    })
      .populate("subject", "name")
      .populate("teacher")
      .populate("class", "name");

    if (!session) {
      return res.status(400).json({ success: false, message: "Invalid QR / Session" });
    }

    // 👤 GET STUDENT
    const student = await Student.findOne({ user: req.user.id })
      .populate("user", "fullName email")
      .populate("class", "name");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // // 🔥 BATCH CHECK
    // if (session.batch !== "All") {
    //   if (student.batch !== session.batch) {
    //     return res.status(403).json({
    //       success: false,
    //       message: `This QR is only for ${session.batch} batch`
    //     });
    //   }
    // }

    // ⏳ CHECK EXPIRY
    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();

      await markAbsentStudents(session);

      return res.status(400).json({ success: false, message: "Session expired" });
    }

    // 👥 CLASS CHECK
    if (student.class._id.toString() !== session.class._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not in this class" });
    }

    // 🔁 PREVENT DUPLICATE
    const exists = await Attendance.findOne({
      student: student._id,
      sessionToken
    });

    if (exists) {
      return res.status(400).json({ success: false, message: "Already marked" });
    }

    // =========================
    // 🎉 MARK PRESENT
    // =========================
    await Attendance.create({
      student: student._id,
      class: session.class,
      subject: session.subject,
      teacher: session.teacher,
      sessionToken,
      status: "Present",
      isQRMarked: true
    });

    // 🔔 SEND NOTIFS
    const parent = await Parent.findOne({ students: student._id }).populate("user");

    const message = `${student.user.fullName} is present in ${session.subject.name}`;

    // Student notif
    await Notification.create({
      user: student.user._id,
      message,
      type: "attendance"
    });

    // Parent notif
    if (parent) {
      await Notification.create({
        user: parent.user._id,
        message,
        type: "attendance"
      });

      const socket = users[parent.user._id];
      if (socket) {
        io.to(socket).emit("newNotification", { message, time: new Date() });
      }
    }

    // ACTIVITY LOG
    await logActivity({
      action: `Attendance marked for ${session.subject.name}`,
      user: student.user.fullName,
      role: "student"
    });

    return res.json({ success: true, message: "Attendance marked successfully" });

  } catch (error) {
    console.error("Mark attendance error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};




// =================================================
// AUTO-MARK ABSENT STUDENTS
// =================================================
const markAbsentStudents = async (session) => {
  try {
    const students = await Student.find({ class: session.class })
      .populate("user", "fullName email");

    for (let student of students) {
      const exists = await Attendance.findOne({
        student: student._id,
        sessionToken: session.sessionToken
      });

      if (!exists) {
        // Mark absent
        await Attendance.create({
          student: student._id,
          class: session.class,
          subject: session.subject,
          teacher: session.teacher,
          sessionToken: session.sessionToken,
          status: "Absent",
          isQRMarked: false
        });

        // student message
        const studentMsg = `You were absent in ${session.subject.name}`;
        await Notification.create({
          user: student.user._id,
          message: studentMsg,
          type: "alert"
        });

        const socket1 = users[student.user._id];
        if (socket1) {
          io.to(socket1).emit("newNotification", {
            message: studentMsg,
            time: new Date()
          });
        }

        // parent message
        const parent = await Parent.findOne({ students: student._id }).populate("user");

        if (parent) {
          const parentMsg = `Your child ${student.user.fullName} was absent in ${session.subject.name}`;

          await Notification.create({
            user: parent.user._id,
            message: parentMsg,
            type: "alert"
          });

          const socket2 = users[parent.user._id];
          if (socket2) {
            io.to(socket2).emit("newNotification", {
              message: parentMsg,
              time: new Date()
            });
          }

          if (parent.user.email) {
            await sendEmail(parent.user.email, "Attendance Alert", parentMsg);
          }
        }
      }
    }

    console.log("✅ Absent students marked");
  } catch (err) {
    console.error("❌ Absent marking error:", err);
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
    const faculty = await Faculty.findOne({ user: req.user.id });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found"
      });
    }

    // Get last 14 days sessions
    const sessions = await AttendanceSession.find({
      teacher: faculty._id
    })
      .populate("subject", "name")
      .populate("class", "name")
      .populate("timetable") // 🔥 IMPORTANT (for batch + type)
      .sort({ createdAt: -1 });

    const data = [];

    for (const session of sessions) {

      const count = await Attendance.countDocuments({
        sessionToken: session.sessionToken
      });

      data.push({
        id: session._id,
        date: session.createdAt,
        day: new Date(session.createdAt).toLocaleDateString("en-US", {
          weekday: "long"
        }),
        subject: session.subject?.name || "N/A",
        class: session.class?.name || "N/A",
        time: `${session.timetable?.startTime} - ${session.timetable?.endTime}`,

        // ✅ NEW FIELDS
        batch: session.timetable?.batch || "All",
        type: session.timetable?.type || "theory",

        studentCount: count,

        status: session.isActive ? "Conducted" : "Conducted"
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Session History Error:", error);
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