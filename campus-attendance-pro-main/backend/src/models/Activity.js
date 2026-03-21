const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    user: {
      type: String,
      required: true
    },
    role:{
      type:String,
      default:""
    },
    meta:{
      type:Object,
      default:{}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);