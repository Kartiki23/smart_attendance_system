const mongoose = require("mongoose");

const facultyLectureNoteSchema = new mongoose.Schema({
  faculty: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Faculty", 
    required: true 
},
  timetable: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Timetable", 
    required: true 
},
  date: { 
    type: Date, 
    required: true 
},
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FacultyLectureNote", facultyLectureNoteSchema);