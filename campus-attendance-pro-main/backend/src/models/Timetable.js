const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({

  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    required: true
  },

  startTime: {
    type: String,
    required: true
  },

  endTime: {
    type: String,
    required: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  },

  group: {
    type: String,
    default: "All" // C1 C2 C3 etc
  },

  room: {
    type: String,
    default: ""
  },

  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  }

},
{
  timestamps: true
});


// Index for fast lecture detection
timetableSchema.index({
  teacher: 1,
  day: 1,
  startTime: 1,
  endTime: 1
});


module.exports = mongoose.model("Timetable", timetableSchema);
