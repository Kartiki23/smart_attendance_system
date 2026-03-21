const Activity = require("../models/Activity");

const logActivity = async ({ action, user, role = "", meta = {} }) => {
  try {
    await Activity.create({
      action,
      user,
      role,
      meta
    });
  } catch (error) {
    console.error("Activity log error:", error.message);
  }
};

module.exports = logActivity;