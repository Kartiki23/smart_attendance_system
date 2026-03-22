const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// 🔹 SEND OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Sending OTP to:", user.email); // ✅ Debug

    // 🔢 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔒 Hash OTP
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.otp = hashedOTP;
    user.otpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    // 📧 Send Email
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 VERIFY OTP + RESET PASSWORD
exports.verifyOTPAndReset = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (
      user.otp !== hashedOTP ||
      user.otpExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // ✅ Update password
    user.password = password;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("Reset Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};