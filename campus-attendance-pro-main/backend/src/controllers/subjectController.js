const Subject = require("../models/Subject");
const logActivity = require("../utils/logActivity");

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private (Admin, Faculty)
exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json({ success: true, count: subjects.length, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin)
exports.createSubject = async (req, res) => {
    try {
        const { name, code, department, semester, credits, type } = req.body;

        const existingSubject = await Subject.findOne({ code });
        if (existingSubject) {
            return res.status(400).json({ success: false, message: 'Subject code already exists' });
        }

        const subject = await Subject.create({
            name, code, department, semester, credits, type
        });

        await logActivity({
      action: `Subject created:${subject.name} (${subject.code})`,
      user: req.user?.fullName || "Admin",
      role: "admin",
      meta: {
        subjectId: subject._id,
        code: subject.code,
        department:subject.department,
        semester: subject.semester
      }
    });

        res.status(201).json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
exports.updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        await logActivity({
      action: `Subject Updated:${subject.name} (${subject.code})`,
      user: req.user?.fullName || "Admin",
      role: "admin",
      meta: {
        name: subject.name,
        code: subject.code,
        department:subject.department,
        semester: subject.semester
      }
    });

        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
exports.deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        await logActivity({
      action: `Subject deleted:${subject.name} (${subject.code})`,
      user: req.user?.fullName || "Admin",
      role: "admin",
      meta: {
        subjectId: subject._id,
        code: subject.code,
        department:subject.department,
        semester: subject.semester
      }
    });

        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
