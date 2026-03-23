const cron = require("node-cron");
const moment = require("moment-timezone");

const Timetable = require("../models/Timetable");
const Student = require("../models/Student");
const Notification = require("../models/Notification");

module.exports = function startLectureReminder(io, users) {

  cron.schedule("* * * * *", async () => {
    try {

      const now = moment().tz("Asia/Kolkata");
      const today = now.format("dddd");

      console.log("⏰ Checking reminders...");

      const lectures = await Timetable.find({ day: today })
        .populate("class")
        .populate("subject");

      for (const lec of lectures) {

        const lecTime = moment.tz(lec.startTime, "HH:mm", "Asia/Kolkata");

        // ✅ Check exactly 10 minutes before lecture
        if (lecTime.diff(now, "minutes") !== 10) continue;

        console.log("🔔 Upcoming lecture:", lec.subject.name);

        // 🔥 Get students (batch-wise)
        let studentQuery = { class: lec.class._id };

        if (lec.batch && lec.batch !== "All") {
          studentQuery.batch = lec.batch; // ⚠️ Make sure Student model has batch
        }

        const students = await Student.find(studentQuery).populate("user");

        for (const student of students) {

          // ✅ Avoid duplicate notification
          const alreadySent = await Notification.findOne({
            user: student.user._id,
            type: "lecture",
            createdAt: {
              $gte: moment().startOf("day").toDate()
            },
            message: {
              $regex: lec.subject.name
            }
          });

          if (alreadySent) continue;

          // ✅ Practical / Theory label
          const typeLabel =
            lec.type === "practical" ? "Practical" : "Theory";

          // ✅ Batch display
          const batchLabel =
            lec.batch && lec.batch !== "All" ? ` (${lec.batch})` : "";

          const message =
            `${lec.subject.name} ${typeLabel}${batchLabel} starts at ${lec.startTime}`;

          // Save notification
          await Notification.create({
            user: student.user._id,
            message,
            type: "lecture"
          });

          // 🔴 Real-time push with SOUND FLAG
          const socketId = users[student.user._id];

          if (socketId) {
            io.to(socketId).emit("newNotification", {
              message,
              playSound: true, // 🔥 IMPORTANT
              time: new Date()
            });
          }
        }
      }

    } catch (error) {
      console.error("Reminder error:", error);
    }
  });

};