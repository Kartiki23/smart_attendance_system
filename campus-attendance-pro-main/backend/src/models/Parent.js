const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],

    studentRollNumber: {
        type: String,
        required: true
    },

    relation: {
        type: String,
        enum: ["Father", "Mother", "Guardian"],
        default: "Guardian"
    },

    contactNumber: {
        type: String,
        trim: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Parent", parentSchema);