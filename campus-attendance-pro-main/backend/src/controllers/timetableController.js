const xlsx = require("xlsx");

const Timetable = require("../models/Timetable");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const logActivity = require("../utils/logActivity");


// =================================================
// ADMIN: Upload Timetable Excel
// =================================================

exports.uploadTimetable = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file required" });
    }

    await Timetable.deleteMany({});

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const headerRow = data[2];
    const timeslots = headerRow.slice(1);

    let success = 0;
    let errors = [];

    const classData = await Class.findOne();
    if (!classData) {
      return res.status(400).json({ message: "No class found in DB" });
    }

    // 🔥 ONLY READ TIMETABLE ROWS (Monday → Saturday)
    for (let i = 3; i <= 8; i++) {
      const row = data[i];
      if (!row) continue;

      const day = row[0];
      if (!day) continue;

      for (let j = 1; j < row.length; j++) {
        let cell = row[j];
        const time = timeslots[j - 1];

        if (!cell || !time) continue;

        cell = cell.toString().trim();

        if (
          cell === "-" ||
          cell.toUpperCase().includes("RECESS")
        ) continue;

        const [startTime, endTime] = time.split("-").map(t => t.trim());

        try {
          const lines = cell.split("\n");

          for (let rawLine of lines) {
            let line = rawLine.trim();
            if (!line) continue;

            // 🔥 IGNORE NON-TIMETABLE TEXT
            if (
              line.includes("Course") ||
              line.includes("Batch") ||
              line.includes("Roll") ||
              line.includes("Title")
            ) {
              continue;
            }

            // Clean unwanted words
            line = line.replace(/MSBTE|CET/gi, "").trim();

            // =========================
            // THEORY FORMAT (FIXED REGEX)
            // =========================
            const theoryMatch = line.match(/^([A-Z]+)\s*\(\s*(.*?)\s*\)$/i);

            if (theoryMatch) {
              const subjectCode = theoryMatch[1].trim().toUpperCase();
              const teacherRaw = theoryMatch[2].trim();
              const teacherCode = teacherRaw.replace(/\s+/g, "").toUpperCase();

              const subject = await Subject.findOne({
                code: { $regex: `^${subjectCode}$`, $options: "i" }
              });

              if (!subject) {
                errors.push(`Row ${i + 1}: Subject ${subjectCode} not found`);
                continue;
              }

              let faculty = null;

              // 🔥 FIX ALL STAFF ISSUE
              if (teacherCode !== "ALLSTAFF") {
                faculty = await Faculty.findOne({
                  employeeId: { $regex: `^${teacherCode}$`, $options: "i" }
                });

                if (!faculty) {
                  errors.push(`Row ${i + 1}: Faculty ${teacherCode} not found`);
                  continue;
                }
              }

              await Timetable.findOneAndUpdate(
                {
                  class: classData._id,
                  day,
                  startTime
                },
                {
                  class: classData._id,
                  day,
                  startTime,
                  endTime,
                  subject: subject._id,
                  teacher: faculty ? faculty._id : null
                },
                { upsert: true }
              );

              success++;
              continue;
            }

            // =========================
            // LAB FORMAT
            // =========================
            const labMatch = line.match(/(C\d)\s*-\s*([A-Z]+)\s*-\s*([A-Z]+)/i);

            if (labMatch) {
              const group = labMatch[1].toUpperCase();
              const subjectCode = labMatch[2].toUpperCase();
              const teacherCode = labMatch[3].toUpperCase();

              const subject = await Subject.findOne({
                code: { $regex: `^${subjectCode}$`, $options: "i" }
              });

              const faculty = await Faculty.findOne({
                employeeId: { $regex: `^${teacherCode}$`, $options: "i" }
              });

              if (!subject) {
                errors.push(`Row ${i + 1}: Subject ${subjectCode} not found`);
                continue;
              }

              if (!faculty) {
                errors.push(`Row ${i + 1}: Faculty ${teacherCode} not found`);
                continue;
              }

              const roomMatch = line.match(/LAB\s*(\d+)/i);
              const room = roomMatch ? `LAB ${roomMatch[1]}` : "";

              await Timetable.findOneAndUpdate(
                {
                  class: classData._id,
                  day,
                  startTime,
                  group
                },
                {
                  class: classData._id,
                  day,
                  startTime,
                  endTime,
                  subject: subject._id,
                  teacher: faculty._id,
                  group,
                  room
                },
                { upsert: true }
              );

              success++;
              continue;
            }

            // UNKNOWN FORMAT
            errors.push(`Row ${i + 1}: Invalid format -> ${line}`);
          }

        } catch (err) {
          errors.push(`Row ${i + 1}: ${err.message}`);
        }
      }
    }

    await logActivity({
          action: errors.length>0 ?`Timetable uploaded with ${errors.length}errors`:"Timetable uploaded successfully",
          user: req.user?.fullName || "Admin",
          role: "admin",
          meta: {
           classId:classData._id,
           entriesAdded:success,
           errorCount:errors.length
          }
        });

    // FINAL RESPONSE
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Timetable uploaded with ${errors.length} errors`,
        results: {
          entriesAdded: success,
          errors
        }
      });
    }

    res.json({
      success: true,
      message: "Timetable uploaded successfully",
      results: {
        entriesAdded: success,
        errors: []
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};



// =================================================
// GET DAILY SCHEDULE
// =================================================

// const Timetable = require("../models/Timetable");
// const Student = require("../models/Student");
// const Faculty = require("../models/Faculty");

exports.getDailySchedule = async (req, res) => {
  try {
    const { role, date } = req.query;

    const targetDate = date ? new Date(date) : new Date();

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];

    const today = days[targetDate.getDay()];
    let query = { day: today };

    console.log("Today:", today);
    console.log("Role:", role);

    if (role === "student") {
      const student = await Student.findOne({ user: req.user.id }).populate("class");

      console.log("Student:", student);
      console.log("Student class:", student?.class);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found"
        });
      }

      if (!student.class) {
        return res.status(400).json({
          success: false,
          message: "Student class not assigned"
        });
      }

      query.class = student.class._id;
    } else if (role === "faculty") {
      const faculty = await Faculty.findOne({ user: req.user.id });

      console.log("Faculty:", faculty);

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty profile not found"
        });
      }

      query.teacher = faculty._id;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    console.log("Final Query:", query);

    const allToday = await Timetable.find({ day: today })
      .populate("subject", "name code")
      .populate("class", "name department semester");

    console.log("All timetable entries for today:", allToday);

    const schedule = await Timetable.find(query)
      .populate("subject", "name code")
      .populate("class", "name department semester")
      .populate({
        path: "teacher",
        populate: {
          path: "user",
          select: "fullName"
        }
      })
      .sort({ startTime: 1 });

    console.log("Matched schedule:", schedule);

    res.status(200).json({
      success: true,
      day: today,
      count: schedule.length,
      data: schedule
    });

  } catch (error) {
    console.error("Get Schedule Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error fetching schedule"
    });
  }
};
// =================================================
// GET TIMETABLE BY CLASS ID
// =================================================
exports.getTimetableByClass = async (req, res) => {
    try {
        const timetable = await Timetable.find({ class: req.params.classId })
            .populate('subject', 'name code')
            .populate({ path: 'teacher', populate: { path: 'user', select: 'fullName' } })
            .sort({ day: 1, startTime: 1 });
            
        res.status(200).json({ success: true, count: timetable.length, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =================================================
// UPDATE TIMETABLE ENTRY
// =================================================
exports.updateTimetableEntry = async (req, res) => {
  try {

    const { subject, teacher } = req.body;

    const updated = await Timetable.findByIdAndUpdate(
      req.params.id,
      {
        subject,
        teacher: teacher || null
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updated
    });

  } catch (err) {
    res.status(500).json({
      message: "Update failed"
    });
  }
};

// =================================================
// DELETE TIMETABLE ENTRY
// =================================================
exports.deleteTimetableEntry = async (req, res) => {
    try {
        const entry = await Timetable.findByIdAndDelete(req.params.id);

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Timetable entry not found' });
        }

        res.status(200).json({ success: true, message: 'Timetable entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};