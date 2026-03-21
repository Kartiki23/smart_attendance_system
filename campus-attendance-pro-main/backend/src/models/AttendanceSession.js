const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema({

  sessionToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },

  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",   // changed from Teacher → Faculty (to match timetable model)
    required: true
  },

  timetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Timetable"
  },

  startTime: {
    type: Date,
    default: Date.now
  },

  expiresAt: {
    type: Date,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });


// Auto expire session after expiry time
attendanceSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);


// Faster query for active sessions
attendanceSessionSchema.index({
  teacher: 1,
  subject: 1,
  class: 1,
  isActive: 1
});


module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);