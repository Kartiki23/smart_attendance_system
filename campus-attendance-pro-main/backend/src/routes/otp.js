const express = require("express");
const { sendOTP, verifyOTPAndReset } = require("../controllers/otpController");
const router = express.Router();



router.post("/send-otp", sendOTP);
router.post("/reset-password-otp", verifyOTPAndReset);

module.exports = router;