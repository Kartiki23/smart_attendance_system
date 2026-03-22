const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, html }) => {
  try {
    if (!email) {
      throw new Error("Recipient email is missing");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email, // ✅ FIX HERE
      subject,
      html,
    });

    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;