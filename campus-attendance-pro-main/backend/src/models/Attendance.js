const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },

    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },

    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },

    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },

    // QR Session Token (for QR attendance)
    sessionToken: {
        type: String
    },

    date: {
        type: Date,
        default: Date.now,
        required: true
    },

    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late'],
        default: 'Present'
    },

    timetableEntry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timetable'
    },

    // Device or scan verification (optional security)
    scannedFrom: {
        type: String
    },

    // Prevent duplicate attendance
    isQRMarked: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});


// Prevent duplicate attendance for same student + subject + date
attendanceSchema.index({ student: 1, subject: 1, date: 1 });


// Prevent duplicate QR scan
attendanceSchema.index({ student: 1, sessionToken: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);