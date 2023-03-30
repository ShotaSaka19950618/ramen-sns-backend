const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    useridSend: {
      type: String,
      require: true,
    },
    useridReceived: {
      type: String,
      require: true,
    },
    postid: {
      type: String,
      require: true,
    },
    postDesc: {
      type: String,
      max: 140,
    },
    desc: {
      type: String,
      max: 140,
    },
    check: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
