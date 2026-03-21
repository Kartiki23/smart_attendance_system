const User = require("../models/User");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Parent = require("../models/Parent");

const pick = (obj = {}, keys = []) => {
  const out = {};
  keys.forEach((key) => {
    if (obj[key] !== undefined) out[key] = obj[key];
  });
  return out;
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let profile = null;

    if (user.role === "student") {
      profile = await Student.findOne({ user: userId })
        .populate("user", "fullName email role")
        .populate("class", "name department semester")
        .lean();

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found"
        });
      }
    } else if (user.role === "faculty") {
      profile = await Faculty.findOne({ user: userId })
        .populate("user", "fullName email role")
        .populate("subjects", "name code")
        .lean();

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Faculty profile not found"
        });
      }
    } else if (user.role === "parent") {
      profile = await Parent.findOne({ user: userId })
        .populate("user", "fullName email role")
        .populate({
          path: "students",
          populate: [
            { path: "user", select: "fullName email" },
            { path: "class", select: "name department semester" }
          ]
        })
        .lean();

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Parent profile not found"
        });
      }
    } else if (user.role === "admin") {
      profile = { user };
    }

    return res.status(200).json({
      success: true,
      data: {
        role: user.role,
        user,
        profile
      }
    });
  } catch (error) {
    console.error("Get my profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { fullName, email } = req.body;

    if (email && email !== currentUser.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: userId }
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }
    }

    const userUpdates = pick(req.body, ["fullName", "email"]);
    const updatedUser = await User.findByIdAndUpdate(userId, userUpdates, {
      new: true,
      runValidators: true
    }).select("-password");

    let updatedProfile = null;

    if (currentUser.role === "student") {
      const studentUpdates = pick(req.body, [
        "department",
        "semester",
        "rollNo",
        "phone",
        "address",
        "bloodGroup",
        "dateOfBirth",
        "academicYear",
        "admissionDate"
      ]);

      updatedProfile = await Student.findOneAndUpdate(
        { user: userId },
        studentUpdates,
        { new: true, runValidators: true }
      )
        .populate("user", "fullName email role")
        .populate("class", "name department semester");
    } else if (currentUser.role === "faculty") {
      const facultyUpdates = pick(req.body, [
        "department",
        "employeeId",
        "phone",
        "address",
        "dateOfBirth"
      ]);

      updatedProfile = await Faculty.findOneAndUpdate(
        { user: userId },
        facultyUpdates,
        { new: true, runValidators: true }
      )
        .populate("user", "fullName email role")
        .populate("subjects", "name code");
    } else if (currentUser.role === "parent") {
      const parentUpdates = pick(req.body, [
        "relation",
        "contactNumber",
        "studentRollNumber",
        "address"
      ]);

      updatedProfile = await Parent.findOneAndUpdate(
        { user: userId },
        parentUpdates,
        { new: true, runValidators: true }
      )
        .populate("user", "fullName email role")
        .populate({
          path: "students",
          populate: [
            { path: "user", select: "fullName email" },
            { path: "class", select: "name department semester" }
          ]
        });
    } else {
      updatedProfile = { user: updatedUser };
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        role: currentUser.role,
        user: updatedUser,
        profile: updatedProfile
      }
    });
  } catch (error) {
    console.error("Update my profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};