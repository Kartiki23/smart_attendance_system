const express = require("express");
const router = express.Router();

const { authorize, protect } = require("../middleware/auth");
const { getMyProfile, updateMyProfile } = require("../controllers/profileController");

router.get(
  "/me",
  protect,
  authorize("student", "faculty", "parent", "admin"),
  getMyProfile
);

router.put(
  "/update-me",
  protect,
  authorize("student", "faculty", "parent", "admin"),
  updateMyProfile
);

module.exports = router;