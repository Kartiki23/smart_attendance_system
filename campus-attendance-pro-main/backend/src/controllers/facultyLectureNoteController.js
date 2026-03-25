const Faculty = require("../models/Faculty");
const FacultyLectureNote = require("../models/FacultyLectureNote");
const Timetable = require("../models/Timetable");

exports.addLectureNote = async (req, res) => {
  try {
    const facultyUserId = req.user.id;
    const { timetableId, reason } = req.body;

    if (!timetableId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Timetable ID and reason are required."
      });
    }

    const faculty = await Faculty.findOne({ user: facultyUserId });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found"
      });
    }

    const note = await FacultyLectureNote.create({
      faculty: faculty._id,
      timetable: timetableId,
      reason,
      date: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Lecture note saved successfully!",
      data: note
    });

  } catch (error) {
    console.error("Add Lecture Note Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};