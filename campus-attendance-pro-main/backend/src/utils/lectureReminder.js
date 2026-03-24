const cron = require("node-cron");
const moment = require("moment-timezone");

const Timetable = require("../models/Timetable");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Notification = require("../models/Notification");

module.exports = function startLectureReminder(io, users) {

  cron.schedule("* * * * *", async () => {
    try {

      const now = moment().tz("Asia/Kolkata");
      const today = now.format("dddd");

      console.log("⏰ Checking reminders...", now.format("HH:mm"));

      const lectures = await Timetable.find({ day: today })
        .populate("class")
        .populate("subject")
        .populate("teacher");

      for (const lec of lectures) {

        const lecTime = moment.tz(lec.startTime, "HH:mm", "Asia/Kolkata");

        const diff = lecTime.diff(now, "minutes");

        // ✅ FIX: allow range instead of exact 10
        if (diff < 9 || diff > 10) continue;

        console.log("🔔 Reminder triggered for:", lec.subject.name);

        // =========================
        // 👨‍🎓 STUDENTS
        // =========================

        let studentQuery = { class: lec.class._id };

        if (lec.batch && lec.batch !== "All") {
          studentQuery.batch = lec.batch;
        }

        const students = await Student.find(studentQuery).populate("user");

        const typeLabel = lec.type === "practical" ? "Practical" : "Theory";
        const batchLabel = lec.batch !== "All" ? ` (${lec.batch})` : "";

        const message =
          `${lec.subject.name} ${typeLabel}${batchLabel} starts at ${lec.startTime}`;

        for (const student of students) {

          const alreadySent = await Notification.findOne({
            user: student.user._id,
            message,
            type: "lecture"
          });

          if (alreadySent) continue;

          await Notification.create({
            user: student.user._id,
            message,
            type: "lecture"
          });

          const socketId = users[student.user._id];

          if (socketId) {
            io.to(socketId).emit("newNotification", {
              message,
              playSound: true,
              time: new Date()
            });
          }
        }

        // =========================
        // 👨‍🏫 FACULTY (FIX ADDED)
        // =========================

        if (lec.teacher) {

          const faculty = await Faculty.findById(lec.teacher).populate("user");

          if (faculty) {

            const alreadySent = await Notification.findOne({
              user: faculty.user._id,
              message,
              type: "lecture"
            });

            if (!alreadySent) {

              await Notification.create({
                user: faculty.user._id,
                message,
                type: "lecture"
              });

              const socketId = users[faculty.user._id];

              if (socketId) {
                io.to(socketId).emit("newNotification", {
                  message,
                  playSound: true,
                  time: new Date()
                });
              }
            }
          }
        }

      }

    } catch (error) {
      console.error("Reminder error:", error);
    }
  });

};