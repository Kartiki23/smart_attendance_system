const Notification = require("../models/Notification");

// ✅ Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Mark as read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      read: true
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};