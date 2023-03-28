const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      require: true,
    },
    shopname: {
      type: String,
      required: true,
      max: 30,
    },
    desc: {
      type: String,
      max: 140,
    },
    img: {
      type: String,
      default: "",
    },
    commentsSend: {
      type: Array,
      default: [],
    },
    commentsReceived: {
      type: Array,
      default: [],
    },
    likes: {
      type: Array,
      default: [],
    },
    bookmarks: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", PostSchema);
